import logger from '../utils/logger.js';

// ==========================================
// HELPER FUNCTIONS & KEY GENERATORS
// ==========================================

export function unwrapReplitData(data) {
    if (data && typeof data === 'object' && 'value' in data) {
        return data.value;
    }
    return data;
}

export function getApplicationSettingsKey(guildId) {
    return `guild:${guildId}:applications:settings`;
}

export function getApplicationKey(guildId, applicationId) {
    return `guild:${guildId}:applications:${applicationId}`;
}

export function getUserApplicationsKey(guildId, userId) {
    return `guild:${guildId}:user:${userId}:applications`;
}

export function getApplicationRoleSettingsKey(guildId, roleId) {
    return `guild:${guildId}:applications:role:${roleId}:settings`;
}

export function getJoinToCreateConfigKey(guildId) {
    return `guild:${guildId}:jointocreate:config`;
}

export function buildApplicationSettingsDefaults() {
    return {
        pendingApplicationRetentionDays: 30,
        reviewedApplicationRetentionDays: 14,
        logChannelId: null
    };
}

// ==========================================
// APPLICATION SETTINGS & RETENTION
// ==========================================

export async function getApplicationSettings(client, guildId) {
    if (!client.db) {
        logger.warn('Database not available for getApplicationSettings');
        return buildApplicationSettingsDefaults();
    }
    
    const key = getApplicationSettingsKey(guildId);
    try {
        const settings = await client.db.get(key, {});
        const unwrapped = unwrapReplitData(settings);
        const defaultSettings = buildApplicationSettingsDefaults();
        
        return { ...defaultSettings, ...unwrapped };
    } catch (error) {
        logger.error(`Error getting application settings for guild ${guildId}:`, error);
        return buildApplicationSettingsDefaults();
    }
}

export async function saveApplicationSettings(client, guildId, settings) {
    const key = getApplicationSettingsKey(guildId);
    try {
        const existingSettings = await getApplicationSettings(client, guildId);
        const mergedSettings = { ...existingSettings, ...settings };
        
        await client.db.set(key, mergedSettings);
        return true;
    } catch (error) {
        logger.error(`Error saving application settings for guild ${guildId}:`, error);
        return false;
    }
}

function getApplicationRetentionDays(settings = {}) {
    const pendingRaw = Number(settings.pendingApplicationRetentionDays);
    const reviewedRaw = Number(settings.reviewedApplicationRetentionDays);

    const pendingDays = Number.isFinite(pendingRaw) ? Math.min(Math.max(pendingRaw, 1), 3650) : 30;
    const reviewedDays = Number.isFinite(reviewedRaw) ? Math.min(Math.max(reviewedRaw, 1), 3650) : 14;

    return { pendingDays, reviewedDays };
}

function isApplicationExpired(application, retentionDays, now = Date.now()) {
    if (!application || typeof application !== 'object') {
        return false;
    }

    const createdAt = Number(application.createdAt) || now;
    const updatedAt = Number(application.updatedAt) || createdAt;
    const reviewedAt = application.reviewedAt ? Number(new Date(application.reviewedAt)) : null;
    const status = typeof application.status === 'string' ? application.status.toLowerCase() : 'pending';

    const ageMsFromCreated = now - createdAt;
    const ageMsFromReviewed = now - (reviewedAt || updatedAt || createdAt);
    const pendingRetentionMs = retentionDays.pendingDays * 24 * 60 * 60 * 1000;
    const reviewedRetentionMs = retentionDays.reviewedDays * 24 * 60 * 60 * 1000;

    if (status === 'pending') {
        return ageMsFromCreated > pendingRetentionMs;
    }

    if (status === 'approved' || status === 'denied') {
        return ageMsFromReviewed > reviewedRetentionMs;
    }

    return ageMsFromCreated > pendingRetentionMs;
}

export async function deleteApplication(client, guildId, applicationId, userIdHint = null) {
    const key = getApplicationKey(guildId, applicationId);

    try {
        const existing = unwrapReplitData(await client.db.get(key, null));
        const userId = userIdHint || existing?.userId || null;

        await client.db.delete(key);

        if (userId) {
            const userKey = getUserApplicationsKey(guildId, userId);
            const userApplications = await client.db.get(userKey, []);
            const unwrapped = unwrapReplitData(userApplications);
            const ids = Array.isArray(unwrapped) ? unwrapped : [];
            const filtered = ids.filter(id => id !== applicationId);
            await client.db.set(userKey, filtered);
        }

        return true;
    } catch (error) {
        logger.error(`Error deleting application ${applicationId} in guild ${guildId}:`, error);
        return false;
    }
}

export async function cleanupExpiredApplications(client, guildId) {
    try {
        if (!client.db || typeof client.db.list !== 'function') {
            return { removed: 0, scanned: 0 };
        }

        const settings = await getApplicationSettings(client, guildId);
        const retentionDays = getApplicationRetentionDays(settings);
        const prefix = `guild:${guildId}:applications:`;
        let keys = await client.db.list(prefix);

        if (!Array.isArray(keys)) {
            if (typeof keys === 'object' && keys !== null) {
                keys = Object.keys(keys).filter(key => key.startsWith(prefix));
            } else {
                return { removed: 0, scanned: 0 };
            }
        }

        const applicationKeyPattern = new RegExp(`^guild:${guildId}:applications:[^:]+$`);
        const applicationKeys = keys.filter(key => applicationKeyPattern.test(key));

        const now = Date.now();
        let removed = 0;

        // Procesamiento en paralelos/lotes para evitar cuellos de botella
        const apps = await Promise.all(
            applicationKeys.map(async (key) => {
                const app = unwrapReplitData(await client.db.get(key, null));
                return { key, app };
            })
        );

        for (const { app } of apps) {
            if (!app) continue;

            if (isApplicationExpired(app, retentionDays, now)) {
                const deleted = await deleteApplication(client, guildId, app.id, app.userId);
                if (deleted) {
                    removed += 1;
                }
            }
        }

        return { removed, scanned: applicationKeys.length };
    } catch (error) {
        logger.error(`Error cleaning expired applications for guild ${guildId}:`, error);
        return { removed: 0, scanned: 0 };
    }
}
// ==========================================
// APPLICATION ROLE SETTINGS
// ==========================================

export async function getApplicationRoleSettings(client, guildId, roleId) {
    try {
        if (!client.db || typeof client.db.get !== "function") {
            return { questions: null, logChannelId: null };
        }

        const key = getApplicationRoleSettingsKey(guildId, roleId);
        const settings = await client.db.get(key, {});
        return unwrapReplitData(settings) || { questions: null, logChannelId: null };
    } catch (error) {
        logger.error(`Error getting application role settings for ${guildId}:${roleId}:`, error);
        return { questions: null, logChannelId: null };
    }
}

export async function saveApplicationRoleSettings(client, guildId, roleId, settings) {
    try {
        if (!client.db || typeof client.db.set !== "function") {
            logger.error("Database client is not available for saveApplicationRoleSettings.");
            return false;
        }

        const key = getApplicationRoleSettingsKey(guildId, roleId);
        await client.db.set(key, settings);
        return true;
    } catch (error) {
        logger.error(`Error saving application role settings for ${guildId}:${roleId}:`, error);
        return false;
    }
}

export async function deleteApplicationRoleSettings(client, guildId, roleId) {
    try {
        if (!client.db || typeof client.db.delete !== "function") {
            logger.error("Database client is not available for deleteApplicationRoleSettings.");
            return false;
        }

        const key = getApplicationRoleSettingsKey(guildId, roleId);
        await client.db.delete(key);
        return true;
    } catch (error) {
        logger.error(`Error deleting application role settings for ${guildId}:${roleId}:`, error);
        return false;
    }
}

// ==========================================
// APPLICATION CRUD OPERATIONS
// ==========================================

export async function createApplication(client, application) {
    const { guildId, userId } = application;
    const applicationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = getApplicationKey(guildId, applicationId);
    
    const newApplication = {
        ...application,
        id: applicationId,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reviewedBy: null,
        reviewedAt: null,
        notes: []
    };

    try {
        if (!client.db || typeof client.db.set !== "function") {
            logger.error("Database client is not available for createApplication.");
            throw new Error("Database not available");
        }

        await client.db.set(key, newApplication);
        
        const userKey = getUserApplicationsKey(guildId, userId);
        const userApplications = await client.db.get(userKey, []);
        const unwrappedApplications = unwrapReplitData(userApplications);
        
        const applicationsArray = Array.isArray(unwrappedApplications) ? [...unwrappedApplications] : [];
        applicationsArray.push(applicationId);
        
        await client.db.set(userKey, applicationsArray);
        if (process.env.NODE_ENV !== 'production') {
            logger.debug(`Successfully created application ${applicationId} for user ${userId}`);
        }
        
        return newApplication;
    } catch (error) {
        logger.error(`Error creating application for user ${userId} in guild ${guildId}:`, error);
        throw error;
    }
}

export async function getApplication(client, guildId, applicationId) {
    const key = getApplicationKey(guildId, applicationId);
    try {
        await cleanupExpiredApplications(client, guildId);
        const application = await client.db.get(key, null);
        return unwrapReplitData(application);
    } catch (error) {
        logger.error(`Error getting application ${applicationId} in guild ${guildId}:`, error);
        return null;
    }
}

export async function updateApplication(client, guildId, applicationId, updates) {
    const key = getApplicationKey(guildId, applicationId);
    try {
        const existingApplication = await getApplication(client, guildId, applicationId);
        if (!existingApplication) {
            throw new Error(`Application ${applicationId} not found`);
        }
        
        const updatedApplication = {
            ...existingApplication,
            ...updates,
            updatedAt: Date.now()
        };
        
        await client.db.set(key, updatedApplication);
        return updatedApplication;
    } catch (error) {
        logger.error(`Error updating application ${applicationId} in guild ${guildId}:`, error);
        throw error;
    }
}

export async function getUserApplications(client, guildId, userId) {
    const userKey = getUserApplicationsKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.get !== "function") {
            logger.error("Database client is not available for getUserApplications.");
            return [];
        }

        await cleanupExpiredApplications(client, guildId);

        const applicationIds = await client.db.get(userKey, []);
        const unwrappedIds = unwrapReplitData(applicationIds);
        
        const idsArray = Array.isArray(unwrappedIds) ? unwrappedIds : [];
        
        const applicationPromises = idsArray.map(id => 
            getApplication(client, guildId, id)
        );
        
        const applications = await Promise.all(applicationPromises);
        return applications.filter(Boolean);
    } catch (error) {
        logger.error(`Error getting applications for user ${userId} in guild ${guildId}:`, error);
        return [];
    }
}

export async function getApplications(client, guildId, filters = {}) {
    const {
        status,
        userId,
        limit = 50,
        offset = 0
    } = filters;
    
    try {
        if (!client.db || typeof client.db.list !== "function") {
            logger.error("Database client is not available for getApplications.");
            return [];
        }

        await cleanupExpiredApplications(client, guildId);

        const prefix = `guild:${guildId}:applications:`;
        let keys = await client.db.list(prefix);
        
        if (!Array.isArray(keys)) {
            if (typeof keys === 'object' && keys !== null) {
                keys = Object.keys(keys).filter(key => key.startsWith(prefix));
            } else {
                return [];
            }
        }
        
        const applicationKeyPattern = new RegExp(`^guild:${guildId}:applications:[^:]+$`);
        const applicationKeys = keys.filter(key => applicationKeyPattern.test(key));
        
        const applicationPromises = applicationKeys.map(key => client.db.get(key));
        let applications = (await Promise.all(applicationPromises))
            .map(unwrapReplitData)
            .filter(Boolean);
        
        if (status) {
            applications = applications.filter(app => app.status === status);
        }
        
        if (userId) {
            applications = applications.filter(app => app.userId === userId);
        }
        
        applications.sort((a, b) => b.createdAt - a.createdAt);
        
        return applications.slice(offset, offset + limit);
    } catch (error) {
        logger.error(`Error getting applications for guild ${guildId}:`, error);
        return [];
    }
}

// ==========================================
// JOIN TO CREATE CONFIG & TEMPORARY CHANNELS
// ==========================================

export async function getJoinToCreateConfig(client, guildId) {
    if (!client.db) {
        logger.warn('Database not available for getJoinToCreateConfig');
        return {
            enabled: false,
            triggerChannels: [],
            categoryId: null,
            channelNameTemplate: "{username}'s Room",
            userLimit: 0,
            bitrate: 64000,
            temporaryChannels: {}
        };
    }
    
    const key = getJoinToCreateConfigKey(guildId);
    try {
        const config = await client.db.get(key, {});
        const unwrapped = unwrapReplitData(config) || {};
        
        return {
            enabled: unwrapped.enabled || false,
            triggerChannels: unwrapped.triggerChannels || [],
            categoryId: unwrapped.categoryId || null,
            channelNameTemplate: unwrapped.channelNameTemplate || "{username}'s Room",
            userLimit: unwrapped.userLimit || 0,
            bitrate: unwrapped.bitrate || 64000,
            temporaryChannels: unwrapped.temporaryChannels || {},
            ...unwrapped
        };
    } catch (error) {
        logger.error(`Error getting Join to Create config for guild ${guildId}:`, error);
        return {
            enabled: false,
            triggerChannels: [],
            categoryId: null,
            channelNameTemplate: "{username}'s Room",
            userLimit: 0,
            bitrate: 64000,
            temporaryChannels: {}
        };
    }
}

export async function saveJoinToCreateConfig(client, guildId, config) {
    const key = getJoinToCreateConfigKey(guildId);
    try {
        const existingConfig = await getJoinToCreateConfig(client, guildId);
        const mergedConfig = { ...existingConfig, ...config };
        
        await client.db.set(key, mergedConfig);
        return true;
    } catch (error) {
        logger.error(`Error saving Join to Create config for guild ${guildId}:`, error);
        return false;
    }
}

export async function updateJoinToCreateConfig(client, guildId, updates) {
    try {
        const currentConfig = await getJoinToCreateConfig(client, guildId);
        const updatedConfig = { ...currentConfig, ...updates };
        
        await saveJoinToCreateConfig(client, guildId, updatedConfig);
        return updatedConfig;
    } catch (error) {
        logger.error(`Error updating Join to Create config for guild ${guildId}:`, error);
        throw error;
    }
}

export async function addJoinToCreateTrigger(client, guildId, channelId, options = {}) {
    try {
        const config = await getJoinToCreateConfig(client, guildId);
        
        if (config.triggerChannels.includes(channelId)) {
            return false;
        }
        
        const triggerChannels = [...config.triggerChannels, channelId];
        const channelOptions = { ...(config.channelOptions || {}) };

        if (Object.keys(options).length > 0) {
            channelOptions[channelId] = {
                nameTemplate: options.nameTemplate || config.channelNameTemplate,
                userLimit: options.userLimit || config.userLimit,
                bitrate: options.bitrate || config.bitrate
            };
        }

        const updatedConfig = {
            ...config,
            triggerChannels,
            channelOptions,
            enabled: triggerChannels.length > 0
        };
        
        return await saveJoinToCreateConfig(client, guildId, updatedConfig);
    } catch (error) {
        logger.error(`Error adding Join to Create trigger for guild ${guildId}:`, error);
        return false;
    }
}

export async function removeJoinToCreateTrigger(client, guildId, channelId) {
    try {
        const config = await getJoinToCreateConfig(client, guildId);
        
        const triggerChannels = config.triggerChannels.filter(id => id !== channelId);
        const channelOptions = { ...(config.channelOptions || {}) };
        
        if (channelOptions[channelId]) {
            delete channelOptions[channelId];
        }

        const updatedConfig = {
            ...config,
            triggerChannels,
            channelOptions,
            enabled: triggerChannels.length > 0
        };
        
        return await saveJoinToCreateConfig(client, guildId, updatedConfig);
    } catch (error) {
        logger.error(`Error removing Join to Create trigger for guild ${guildId}:`, error);
        return false;
    }
}

export async function registerTemporaryChannel(client, guildId, channelId, ownerId, triggerChannelId) {
    try {
        const config = await getJoinToCreateConfig(client, guildId);
        const temporaryChannels = { ...(config.temporaryChannels || {}) };

        temporaryChannels[channelId] = {
            ownerId,
            triggerChannelId,
            createdAt: Date.now()
        };
        
        return await saveJoinToCreateConfig(client, guildId, { ...config, temporaryChannels });
    } catch (error) {
        logger.error(`Error registering temporary channel for guild ${guildId}:`, error);
        return false;
    }
}

export async function unregisterTemporaryChannel(client, guildId, channelId) {
    try {
        const config = await getJoinToCreateConfig(client, guildId);
        const temporaryChannels = { ...(config.temporaryChannels || {}) };
        
        if (temporaryChannels[channelId]) {
            delete temporaryChannels[channelId];
            return await saveJoinToCreateConfig(client, guildId, { ...config, temporaryChannels });
        }
        
        return false;
    } catch (error) {
        logger.error(`Error unregistering temporary channel for guild ${guildId}:`, error);
        return false;
    }
}

export async function getTemporaryChannelInfo(client, guildId, channelId) {
    try {
        const config = await getJoinToCreateConfig(client, guildId);
        return config.temporaryChannels?.[channelId] || null;
    } catch (error) {
        logger.error(`Error getting temporary channel info for guild ${guildId}:`, error);
        return null;
    }
}

export function formatChannelName(template, variables = {}) {
    let formatted = template;
    
    const replacements = {
        '{username}': variables.username || 'User',
        '{user_tag}': variables.userTag || 'User#0000',
        '{display_name}': variables.displayName || 'User',
        '{guild_name}': variables.guildName || 'Server',
        '{channel_name}': variables.channelName || 'Voice Channel'
    };
    
    for (const [placeholder, value] of Object.entries(replacements)) {
        formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    formatted = formatted.replace(/[^\p{L}\p{N}\p{So}\p{Sk}\s-]/gu, '').trim();
    formatted = formatted.substring(0, 100);
    
    return formatted || 'Voice Channel';
}

export function generateCaseId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
}
// ==========================================
// GIVEAWAYS MODULE (SQL + KV FALLBACK)
// ==========================================

export async function createGiveaway(client, giveawayData) {
    const {
        guildId,
        channelId,
        messageId,
        hostId,
        prize,
        winnersCount,
        endsAt,
        requirements = {}
    } = giveawayData;

    try {
        // Intento en base de datos relacional (PostgreSQL) si está disponible
        if (client.pgPool) {
            const query = `
                INSERT INTO giveaways (guild_id, channel_id, message_id, host_id, prize, winners_count, ends_at, requirements, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *;
            `;
            const values = [
                guildId,
                channelId,
                messageId,
                hostId,
                prize,
                winnersCount,
                new Date(endsAt),
                JSON.stringify(requirements),
                'active'
            ];
            const result = await client.pgPool.query(query, values);
            return result.rows[0];
        }

        // Fallback a KV Store
        const giveawayId = messageId;
        const key = `guild:${guildId}:giveaways:${giveawayId}`;
        const record = {
            id: giveawayId,
            guildId,
            channelId,
            messageId,
            hostId,
            prize,
            winnersCount,
            endsAt,
            requirements,
            status: 'active',
            participants: [],
            createdAt: Date.now()
        };

        await client.db.set(key, record);

        // Actualizar índice de sorteos activos del servidor
        const indexKey = `guild:${guildId}:giveaways:active_list`;
        const activeList = unwrapReplitData(await client.db.get(indexKey, [])) || [];
        if (!activeList.includes(giveawayId)) {
            activeList.push(giveawayId);
            await client.db.set(indexKey, activeList);
        }

        return record;
    } catch (error) {
        logger.error(`Error creating giveaway in guild ${guildId}:`, error);
        throw error;
    }
}

export async function getGiveaway(client, guildId, messageId) {
    try {
        if (client.pgPool) {
            const query = `SELECT * FROM giveaways WHERE guild_id = $1 AND message_id = $2;`;
            const result = await client.pgPool.query(query, [guildId, messageId]);
            return result.rows[0] || null;
        }

        const key = `guild:${guildId}:giveaways:${messageId}`;
        const data = await client.db.get(key, null);
        return unwrapReplitData(data);
    } catch (error) {
        logger.error(`Error getting giveaway ${messageId} in guild ${guildId}:`, error);
        return null;
    }
}

export async function getActiveGiveaways(client, guildId) {
    try {
        if (client.pgPool) {
            const query = `SELECT * FROM giveaways WHERE guild_id = $1 AND status = 'active';`;
            const result = await client.pgPool.query(query, [guildId]);
            return result.rows;
        }

        const indexKey = `guild:${guildId}:giveaways:active_list`;
        const activeIds = unwrapReplitData(await client.db.get(indexKey, [])) || [];

        const promises = activeIds.map(id => getGiveaway(client, guildId, id));
        const results = await Promise.all(promises);

        return results.filter(g => g && g.status === 'active');
    } catch (error) {
        logger.error(`Error getting active giveaways for guild ${guildId}:`, error);
        return [];
    }
}

export async function endGiveaway(client, guildId, messageId, winners = []) {
    try {
        if (client.pgPool) {
            const query = `
                UPDATE giveaways
                SET status = 'ended', winners = $1, ended_at = NOW()
                WHERE guild_id = $2 AND message_id = $3
                RETURNING *;
            `;
            const result = await client.pgPool.query(query, [JSON.stringify(winners), guildId, messageId]);
            return result.rows[0];
        }

        const giveaway = await getGiveaway(client, guildId, messageId);
        if (!giveaway) return null;

        giveaway.status = 'ended';
        giveaway.winners = winners;
        giveaway.endedAt = Date.now();

        const key = `guild:${guildId}:giveaways:${messageId}`;
        await client.db.set(key, giveaway);

        // Remover de la lista activa
        const indexKey = `guild:${guildId}:giveaways:active_list`;
        const activeIds = unwrapReplitData(await client.db.get(indexKey, [])) || [];
        const updatedList = activeIds.filter(id => id !== messageId);
        await client.db.set(indexKey, updatedList);

        return giveaway;
    } catch (error) {
        logger.error(`Error ending giveaway ${messageId} in guild ${guildId}:`, error);
        throw error;
    }
}

export async function addGiveawayParticipant(client, guildId, messageId, userId) {
    try {
        if (client.pgPool) {
            const query = `
                INSERT INTO giveaway_participants (guild_id, message_id, user_id)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING;
            `;
            await client.pgPool.query(query, [guildId, messageId, userId]);
            return true;
        }

        const giveaway = await getGiveaway(client, guildId, messageId);
        if (!giveaway) return false;

        if (!giveaway.participants) {
            giveaway.participants = [];
        }

        if (!giveaway.participants.includes(userId)) {
            giveaway.participants.push(userId);
            const key = `guild:${guildId}:giveaways:${messageId}`;
            await client.db.set(key, giveaway);
        }

        return true;
    } catch (error) {
        logger.error(`Error adding participant ${userId} to giveaway ${messageId}:`, error);
        return false;
    }
}

export async function removeGiveawayParticipant(client, guildId, messageId, userId) {
    try {
        if (client.pgPool) {
            const query = `
                DELETE FROM giveaway_participants
                WHERE guild_id = $1 AND message_id = $2 AND user_id = $3;
            `;
            await client.pgPool.query(query, [guildId, messageId, userId]);
            return true;
        }

        const giveaway = await getGiveaway(client, guildId, messageId);
        if (!giveaway || !giveaway.participants) return false;

        giveaway.participants = giveaway.participants.filter(id => id !== userId);
        const key = `guild:${guildId}:giveaways:${messageId}`;
        await client.db.set(key, giveaway);

        return true;
    } catch (error) {
        logger.error(`Error removing participant ${userId} from giveaway ${messageId}:`, error);
        return false;
    }
}
// ==========================================
// WELCOME & GOODBYE MESSAGES MODULE
// ==========================================

export function getWelcomeConfigKey(guildId) {
    return `guild:${guildId}:welcome:config`;
}

export function getGoodbyeConfigKey(guildId) {
    return `guild:${guildId}:goodbye:config`;
}

export function buildWelcomeDefaults() {
    return {
        enabled: false,
        channelId: null,
        message: "¡Bienvenido/a {user} a **{guild}**! 🎉",
        embedEnabled: true,
        embedColor: "#5865F2",
        embedTitle: "¡Nuevo Miembro!",
        embedThumbnail: true,
        autoRoles: [],
        dmEnabled: false,
        dmMessage: "¡Gracias por unirte a **{guild}**!"
    };
}

export function buildGoodbyeDefaults() {
    return {
        enabled: false,
        channelId: null,
        message: "**{username}** ha dejado el servidor. 👋",
        embedEnabled: true,
        embedColor: "#ED4245",
        embedTitle: "Miembro Saliente",
        embedThumbnail: true
    };
}

export async function getWelcomeConfig(client, guildId) {
    if (!client.db) {
        logger.warn('Database not available for getWelcomeConfig');
        return buildWelcomeDefaults();
    }

    const key = getWelcomeConfigKey(guildId);
    try {
        const config = await client.db.get(key, {});
        const unwrapped = unwrapReplitData(config);
        const defaults = buildWelcomeDefaults();

        return { ...defaults, ...unwrapped };
    } catch (error) {
        logger.error(`Error getting welcome config for guild ${guildId}:`, error);
        return buildWelcomeDefaults();
    }
}

export async function saveWelcomeConfig(client, guildId, config) {
    if (!client.db) return false;

    const key = getWelcomeConfigKey(guildId);
    try {
        const existing = await getWelcomeConfig(client, guildId);
        const merged = { ...existing, ...config };

        await client.db.set(key, merged);
        return true;
    } catch (error) {
        logger.error(`Error saving welcome config for guild ${guildId}:`, error);
        return false;
    }
}

export async function getGoodbyeConfig(client, guildId) {
    if (!client.db) {
        logger.warn('Database not available for getGoodbyeConfig');
        return buildGoodbyeDefaults();
    }

    const key = getGoodbyeConfigKey(guildId);
    try {
        const config = await client.db.get(key, {});
        const unwrapped = unwrapReplitData(config);
        const defaults = buildGoodbyeDefaults();

        return { ...defaults, ...unwrapped };
    } catch (error) {
        logger.error(`Error getting goodbye config for guild ${guildId}:`, error);
        return buildGoodbyeDefaults();
    }
}

export async function saveGoodbyeConfig(client, guildId, config) {
    if (!client.db) return false;

    const key = getGoodbyeConfigKey(guildId);
    try {
        const existing = await getGoodbyeConfig(client, guildId);
        const merged = { ...existing, ...config };

        await client.db.set(key, merged);
        return true;
    } catch (error) {
        logger.error(`Error saving goodbye config for guild ${guildId}:`, error);
        return false;
    }
}

// ==========================================
// AUTO-ROLES & WELCOME HELPERS
// ==========================================

export async function addAutoRole(client, guildId, roleId) {
    try {
        const config = await getWelcomeConfig(client, guildId);
        const autoRoles = Array.isArray(config.autoRoles) ? [...config.autoRoles] : [];

        if (autoRoles.includes(roleId)) {
            return false;
        }

        autoRoles.push(roleId);
        return await saveWelcomeConfig(client, guildId, { autoRoles });
    } catch (error) {
        logger.error(`Error adding auto role for guild ${guildId}:`, error);
        return false;
    }
}

export async function removeAutoRole(client, guildId, roleId) {
    try {
        const config = await getWelcomeConfig(client, guildId);
        const autoRoles = Array.isArray(config.autoRoles)
            ? config.autoRoles.filter(id => id !== roleId)
            : [];

        return await saveWelcomeConfig(client, guildId, { autoRoles });
    } catch (error) {
        logger.error(`Error removing auto role for guild ${guildId}:`, error);
        return false;
    }
}

export function formatWelcomeVariables(template, member) {
    if (!template || typeof template !== 'string') return '';

    const guild = member.guild;
    const user = member.user;

    const replacements = {
        '{user}': `<@${user.id}>`,
        '{username}': user.username,
        '{displayName}': member.displayName || user.username,
        '{user_tag}': user.tag || `${user.username}#${user.discriminator || '0000'}`,
        '{userId}': user.id,
        '{guild}': guild.name,
        '{server}': guild.name,
        '{memberCount}': guild.memberCount ? guild.memberCount.toString() : '0'
    };

    let formatted = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
        formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return formatted;
}
// ==========================================
// LEVELING SYSTEM MODULE (XP & LEADERBOARD)
// ==========================================

export function getLevelingKey(guildId) {
    return `guild:${guildId}:leveling:config`;
}

export function getUserLevelKey(guildId, userId) {
    return `guild:${guildId}:leveling:user:${userId}`;
}

export function getUserLevelPrefix(guildId) {
    return `guild:${guildId}:leveling:user:`;
}

export async function getLevelingConfig(client, guildId) {
    const key = getLevelingKey(guildId);
    const defaultConfig = {
        enabled: false,
        xpPerMessage: 10,
        xpPerMinute: 60,
        cooldownEnabled: true,
        messageLengthMultiplier: true,
        levelUpMessages: true,
        levelUpChannel: null,
        roles: {},
        milestones: {}
    };

    try {
        if (!client.db || typeof client.db.get !== "function") {
            return defaultConfig;
        }

        const config = await client.db.get(key, defaultConfig);
        const unwrapped = unwrapReplitData(config);
        return { ...defaultConfig, ...unwrapped };
    } catch (error) {
        logger.error(`Error getting leveling config for guild ${guildId}:`, error);
        return defaultConfig;
    }
}

export async function saveLevelingConfig(client, guildId, config) {
    const key = getLevelingKey(guildId);
    try {
        if (!client.db || typeof client.db.set !== "function") {
            logger.error("Database client is not available for saveLevelingConfig.");
            return false;
        }

        const existing = await getLevelingConfig(client, guildId);
        const merged = { ...existing, ...config };

        await client.db.set(key, merged);
        return true;
    } catch (error) {
        logger.error(`Error saving leveling config for guild ${guildId}:`, error);
        return false;
    }
}

export function getXpForLevel(level) {
    return 5 * Math.pow(level, 2) + 50 * level + 50;
}

export async function getUserLevelData(client, guildId, userId) {
    const key = getUserLevelKey(guildId, userId);
    const defaultData = {
        xp: 0,
        level: 0,
        totalXp: 0,
        lastMessage: 0,
        rank: 0,
        xpToNextLevel: getXpForLevel(1)
    };

    try {
        if (!client.db || typeof client.db.get !== "function") {
            return defaultData;
        }

        const rawData = await client.db.get(key, null);
        const data = unwrapReplitData(rawData);

        if (!data) {
            return defaultData;
        }

        const currentLevel = data.level || 0;
        return {
            xp: data.xp || 0,
            level: currentLevel,
            totalXp: data.totalXp || 0,
            lastMessage: data.lastMessage || 0,
            rank: data.rank || 0,
            xpToNextLevel: getXpForLevel(currentLevel + 1)
        };
    } catch (error) {
        logger.error(`Error getting level data for user ${userId} in guild ${guildId}:`, error);
        return defaultData;
    }
}

export async function saveUserLevelData(client, guildId, userId, data) {
    const key = getUserLevelKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.set !== "function") {
            logger.error("Database client is not available for saveUserLevelData.");
            return false;
        }

        const levelData = {
            ...data,
            xp: data.xp || 0,
            level: data.level || 0,
            totalXp: data.totalXp || 0,
            lastMessage: data.lastMessage || 0,
            rank: data.rank || 0,
            updatedAt: Date.now()
        };

        await client.db.set(key, levelData);
        return true;
    } catch (error) {
        logger.error(`Error saving level data for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}

export async function getLeaderboard(client, guildId, limit = 10) {
    try {
        if (!client.db || typeof client.db.list !== "function") {
            logger.error("Database client is not available for getLeaderboard.");
            return [];
        }

        const prefix = getUserLevelPrefix(guildId);
        let keys = await client.db.list(prefix);

        if (!Array.isArray(keys)) {
            if (typeof keys === 'object' && keys !== null) {
                keys = Object.keys(keys).filter(key => key.startsWith(prefix));
            } else {
                return [];
            }
        }

        if (keys.length === 0) {
            return [];
        }

        const userDataPromises = keys.map(async (key) => {
            try {
                const userId = key.replace(prefix, '');
                const rawData = await client.db.get(key);
                if (!rawData) return null;

                const unwrapped = unwrapReplitData(rawData);
                return {
                    userId,
                    xp: unwrapped.xp || 0,
                    level: unwrapped.level || 0,
                    totalXp: unwrapped.totalXp || 0,
                    rank: 0
                };
            } catch (error) {
                logger.error(`Error processing leaderboard key ${key}:`, error);
                return null;
            }
        });

        let userData = (await Promise.all(userDataPromises)).filter(Boolean);

        userData.sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));

        userData = userData.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        return userData.slice(0, limit);
    } catch (error) {
        logger.error(`Error getting leaderboard for guild ${guildId}:`, error);
        return [];
    }
}
// ==========================================
// WARNS & MODERATION MODULE
// ==========================================

export function getWarnKey(guildId, userId) {
    return `guild:${guildId}:warns:${userId}`;
}

export async function addWarn(client, guildId, userId, warnData) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.get !== "function") {
            logger.error("Database client is not available for addWarn.");
            return null;
        }

        const existingRaw = await client.db.get(key, []);
        const existingWarns = unwrapReplitData(existingRaw) || [];
        const warnsArray = Array.isArray(existingWarns) ? [...existingWarns] : [];

        const warnId = generateCaseId();
        const newWarn = {
            id: warnId,
            reason: warnData.reason || "Sin razón especificada",
            moderatorId: warnData.moderatorId,
            timestamp: Date.now()
        };

        warnsArray.push(newWarn);
        await client.db.set(key, warnsArray);

        return newWarn;
    } catch (error) {
        logger.error(`Error adding warn to user ${userId} in guild ${guildId}:`, error);
        return null;
    }
}

export async function getWarns(client, guildId, userId) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.get !== "function") {
            return [];
        }

        const rawData = await client.db.get(key, []);
        const warns = unwrapReplitData(rawData);
        return Array.isArray(warns) ? warns : [];
    } catch (error) {
        logger.error(`Error getting warns for user ${userId} in guild ${guildId}:`, error);
        return [];
    }
}

export async function removeWarn(client, guildId, userId, warnId) {
    const key = getWarnKey(guildId, userId);
    try {
        const warns = await getWarns(client, guildId, userId);
        const filtered = warns.filter(w => w.id !== warnId);

        if (warns.length === filtered.length) {
            return false;
        }

        await client.db.set(key, filtered);
        return true;
    } catch (error) {
        logger.error(`Error removing warn ${warnId} for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}

export async function clearWarns(client, guildId, userId) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.delete !== "function") {
            return false;
        }

        await client.db.delete(key);
        return true;
    } catch (error) {
        logger.error(`Error clearing warns for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}

// ==========================================
// EXPIRED CLEANUP
// ==========================================
// ==========================================
// WARNS & MODERATION MODULE
// ==========================================

export function getWarnKey(guildId, userId) {
    return `guild:${guildId}:warns:${userId}`;
}

export async function addWarn(client, guildId, userId, warnData) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.get !== "function") {
            logger.error("Database client is not available for addWarn.");
            return null;
        }

        const existingRaw = await client.db.get(key, []);
        const existingWarns = unwrapReplitData(existingRaw) || [];
        const warnsArray = Array.isArray(existingWarns) ? [...existingWarns] : [];

        const warnId = generateCaseId();
        const newWarn = {
            id: warnId,
            reason: warnData.reason || "Sin razón especificada",
            moderatorId: warnData.moderatorId,
            timestamp: Date.now()
        };

        warnsArray.push(newWarn);
        await client.db.set(key, warnsArray);

        return newWarn;
    } catch (error) {
        logger.error(`Error adding warn to user ${userId} in guild ${guildId}:`, error);
        return null;
    }
}

export async function getWarns(client, guildId, userId) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.get !== "function") {
            return [];
        }

        const rawData = await client.db.get(key, []);
        const warns = unwrapReplitData(rawData);
        return Array.isArray(warns) ? warns : [];
    } catch (error) {
        logger.error(`Error getting warns for user ${userId} in guild ${guildId}:`, error);
        return [];
    }
}

export async function removeWarn(client, guildId, userId, warnId) {
    const key = getWarnKey(guildId, userId);
    try {
        const warns = await getWarns(client, guildId, userId);
        const filtered = warns.filter(w => w.id !== warnId);

        if (warns.length === filtered.length) {
            return false;
        }

        await client.db.set(key, filtered);
        return true;
    } catch (error) {
        logger.error(`Error removing warn ${warnId} for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}

export async function clearWarns(client, guildId, userId) {
    const key = getWarnKey(guildId, userId);
    try {
        if (!client.db || typeof client.db.delete !== "function") {
            return false;
        }

        await client.db.delete(key);
        return true;
    } catch (error) {
        logger.error(`Error clearing warns for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}

