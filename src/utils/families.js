import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let pgPool = null;

async function initDb() {
    const pathsToTry = [
        '../database/index.js',
        '../database/db.js',
        '../db/index.js',
        '../database.js'
    ];

    for (const dbPath of pathsToTry) {
        try {
            const dbModule = await import(dbPath);
            pgPool = dbModule.default || dbModule.pool || dbModule.db || dbModule;
            if (pgPool) {
                console.log(`✅ [families.js] BD conectada desde: ${dbPath}`);
                break;
            }
        } catch (e) {}
    }
}

await initDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');
const settingsPath = path.join(dataDir, 'tree_settings.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
        console.error("Error cargando tree_settings.json:", e);
    }
    return {};
}

function saveSettings(data) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error guardando tree_settings.json:", e);
        return false;
    }
}

export const DEFAULT_TREE_SETTINGS = {
    userBg: '#1d4ed8',
    userText: '#ffffff',
    nodeBg: '#111111',
    nodeText: '#ffffff',
    lines: '#000000',
    background: '#ffffff',
    direction: 'TB'
};

export async function getTreeSettings(userId) {
    const settings = loadSettings();
    return { ...DEFAULT_TREE_SETTINGS, ...(settings[userId] || {}) };
}

export async function saveTreeSettings(userId, newSettings) {
    const settings = loadSettings();
    settings[userId] = { ...(settings[userId] || DEFAULT_TREE_SETTINGS), ...newSettings };
    return saveSettings(settings);
}

// --- CONSULTAS POSTGRESQL ---

async function ensureDbTable() {
    if (!pgPool) return false;
    try {
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS family_relations (
                id SERIAL PRIMARY KEY,
                guild_id VARCHAR(64) NOT NULL,
                u1 VARCHAR(64) NOT NULL,
                u2 VARCHAR(64) NOT NULL,
                type VARCHAR(32) NOT NULL,
                created_at BIGINT NOT NULL
            );
        `);
        return true;
    } catch (err) {
        console.error("❌ Error en tabla family_relations:", err);
        return false;
    }
}

ensureDbTable();

export async function getGuildRelations(guildId) {
    if (!pgPool) return [];
    try {
        const res = await pgPool.query(
            `SELECT u1, u2, type, created_at AS "createdAt" FROM family_relations WHERE guild_id = $1`,
            [guildId]
        );
        return res.rows;
    } catch (e) {
        console.error("❌ Error leyendo relaciones:", e);
        return [];
    }
}

export async function addRelation(guildId, u1, u2, type) {
    if (!pgPool) return false;
    try {
        const relations = await getGuildRelations(guildId);
        
        // Evitar duplicados comprobando ambos sentidos
        const exists = relations.some(r => 
            ((r.u1 === u1 && r.u2 === u2) || (r.u1 === u2 && r.u2 === u1)) &&
            (r.type === type || (type === 'parent_child' && r.type === 'adoption'))
        );

        if (!exists) {
            await pgPool.query(
                `INSERT INTO family_relations (guild_id, u1, u2, type, created_at) VALUES ($1, $2, $3, $4, $5)`,
                [guildId, u1, u2, type, Date.now()]
            );
        }
        return true;
    } catch (e) {
        console.error("❌ Error agregando relación:", e);
        return false;
    }
}

export async function removeRelation(guildId, u1, u2, type) {
    if (!pgPool) return false;
    try {
        await pgPool.query(
            `DELETE FROM family_relations 
             WHERE guild_id = $1 
             AND (type = $2 OR (type = 'adoption' AND $2 = 'parent_child'))
             AND ((u1 = $3 AND u2 = $4) OR (u1 = $4 AND u2 = $3))`,
            [guildId, type, u1, u2]
        );
        return true;
    } catch (e) {
        console.error("❌ Error eliminando relación:", e);
        return false;
    }
}

export async function getUserFamilyData(guildId, userId) {
    const relations = await getGuildRelations(guildId);
    
    let spouses = [];
    let parents = [];
    let children = [];
    let siblings = [];
    let lovers = [];

    for (const rel of relations) {
        const type = rel.type;
        
        if (type === 'marriage') {
            if (rel.u1 === userId) spouses.push(rel.u2);
            else if (rel.u2 === userId) spouses.push(rel.u1);
        } 
        else if (type === 'parent_child' || type === 'adoption') {
            // u1 es Padre/Madre, u2 es Hijo/a
            if (rel.u2 === userId) parents.push(rel.u1);
            if (rel.u1 === userId) children.push(rel.u2);
        } 
        else if (type === 'sibling') {
            if (rel.u1 === userId) siblings.push(rel.u2);
            else if (rel.u2 === userId) siblings.push(rel.u1);
        } 
        else if (type === 'lover') {
            if (rel.u1 === userId) lovers.push(rel.u2);
            else if (rel.u2 === userId) lovers.push(rel.u1);
        }
    }

    return {
        userId,
        spouses: Array.from(new Set(spouses)),
        parents: Array.from(new Set(parents)),
        children: Array.from(new Set(children)),
        siblings: Array.from(new Set(siblings)),
        lovers: Array.from(new Set(lovers))
    };
}
