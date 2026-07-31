import { pgDb } from '../postgresDatabase.js';
import { MemoryStorage } from '../memoryStorage.js';
import { logger } from '../logger.js';
import { validateGuildConfigOrThrow } from '../schemas.js';

console.log("WRAPPER CARGADO");

class DatabaseWrapper {
    constructor() {
        this.initialized = false;
        this.db = null;
        this.useFallback = false;
        this.connectionType = 'none';
        this.degradedModeWarningShown = false;
        this.degradedReason = null;
    }

    async initialize() {
        if (this.initialized && this.db) {
            return;
        }

        try {
            logger.info('Attempting to connect to PostgreSQL...');

            const pgConnected = await pgDb.connect();

            if (pgConnected) {
                this.db = pgDb;
                this.connectionType = 'postgresql';
                console.log("USANDO POSTGRES");
                this.degradedReason = null;
                logger.info('✅ PostgreSQL Database initialized - using persistent database');
                this.initialized = true;
                return;
            }

            const pgFailure = pgDb.getLastFailure?.();

            if (pgFailure?.reason === 'SCHEMA_VERSION_MISMATCH') {
                const schemaError = new Error(
                    `Schema version mismatch detected (${pgFailure.message}). Run migrations before startup.`,
                );
                schemaError.code = 'SCHEMA_VERSION_MISMATCH';
                throw schemaError;
            }

        } catch (error) {
            logger.warn('PostgreSQL connection failed:', error.message);

            if (error.code === 'SCHEMA_VERSION_MISMATCH') {
                throw error;
            }
        }

        // Fallback a memoria si la conexión a PostgreSQL no se pudo establecer
        this.fallbackToMemory('POSTGRES_UNAVAILABLE');
    }

    fallbackToMemory(reason = 'UNINITIALIZED_FALLBACK') {
        this.db = new MemoryStorage();
        console.log("USANDO MEMORIA (FALLBACK)");
        this.useFallback = true;
        this.connectionType = 'memory';
        this.degradedReason = reason;

        if (!this.degradedModeWarningShown) {
            logger.warn('⚠️ DATABASE DEGRADED MODE ENABLED - Using in-memory storage (data will be lost on restart)');
            logger.warn('⚠️ Please check PostgreSQL connection and restart the bot when fixed');
            this.degradedModeWarningShown = true;
        }

        this.initialized = true;
    }

    // Helper interno para garantizar que `this.db` NUNCA sea null
    ensureDatabaseReady() {
        if (!this.db) {
            // Intentar usar un pool global si existe, de lo contrario usar Memoria
            if (global.pgPool || global.db) {
                this.db = global.pgPool || global.db;
            } else {
                this.fallbackToMemory('AUTO_RECOVERY');
            }
        }
    }

    async set(key, value, ttl = null) {
        this.ensureDatabaseReady();

        if (this.useFallback) {
            logger.debug(`[DEGRADED] Writing to memory: ${key}`);
        }

        if (typeof key === 'string' && /^guild:[^:]+:config$/.test(key)) {
            const guildId = key.split(':')[1];

            validateGuildConfigOrThrow(value, {
                guildId,
                errorCode: 'VALIDATION_FAILED',
            });
        }

        return this.db.set(key, value, ttl);
    }

    async get(key, defaultValue = null) {
        this.ensureDatabaseReady();
        return this.db.get(key, defaultValue);
    }

    async delete(key) {
        this.ensureDatabaseReady();

        if (this.useFallback) {
            logger.debug(`[DEGRADED] Deleting from memory: ${key}`);
        }

        return this.db.delete(key);
    }

    async list(prefix) {
        this.ensureDatabaseReady();
        return this.db.list(prefix);
    }

    async exists(key) {
        this.ensureDatabaseReady();

        if (this.db.exists) {
            return this.db.exists(key);
        }

        const value = await this.db.get(key);
        return value !== null;
    }

    async increment(key, amount = 1) {
        this.ensureDatabaseReady();

        if (this.useFallback) {
            logger.debug(`[DEGRADED] Incrementing in memory: ${key}`);
        }

        if (this.db.increment) {
            return this.db.increment(key, amount);
        }

        const current = await this.db.get(key, 0);
        const newValue = current + amount;

        await this.db.set(key, newValue);

        return newValue;
    }

    async decrement(key, amount = 1) {
        this.ensureDatabaseReady();

        if (this.useFallback) {
            logger.debug(`[DEGRADED] Decrementing in memory: ${key}`);
        }

        if (this.db.decrement) {
            return this.db.decrement(key, amount);
        }

        const current = await this.db.get(key, 0);
        const newValue = current - amount;

        await this.db.set(key, newValue);

        return newValue;
    }

    isDegraded() {
        return this.useFallback;
    }

    isAvailable() {
        return this.db && !this.useFallback;
    }

    getStatus() {
        return {
            initialized: this.initialized,
            connectionType: this.connectionType,
            isDegraded: this.useFallback,
            isAvailable: this.isAvailable(),
            degradedReason: this.degradedReason,
        };
    }

    getConnectionType() {
        return this.connectionType;
    }
}

export const db = new DatabaseWrapper();

export async function initializeDatabase() {
    try {
        logger.info('Initializing Database (PostgreSQL > Memory fallback)...');

        await db.initialize();

        logger.info('✅ Database initialized');

        return { db };

    } catch (error) {
        logger.error('❌ Database Initialization Error:', error);

        if (error.code === 'SCHEMA_VERSION_MISMATCH') {
            throw error;
        }

        return { db };
    }
}

export async function getFromDb(key, defaultValue = null) {
    try {
        const value = await db.get(key);
        return value === null ? defaultValue : value;
    } catch (error) {
        logger.error(`Error getting value for key ${key}:`, error);
        return defaultValue;
    }
}

export async function setInDb(key, value, ttl = null) {
    try {
        await db.set(key, value, ttl);
        return true;
    } catch (error) {
        logger.error(`Error setting value for key ${key}:`, error);
        return false;
    }
}

export async function deleteFromDb(key) {
    try {
        await db.delete(key);
        return true;
    } catch (error) {
        logger.error(`Error deleting key ${key}:`, error);
        return false;
    }
}

export async function listFromDb(prefix) {
    try {
        return await db.list(prefix);
    } catch (error) {
        logger.error(`Error listing keys with prefix ${prefix}:`, error);
        return [];
    }
}
