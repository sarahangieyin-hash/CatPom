import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 🎯 ACCESO Y EXTRACCIÓN PROFUNDA DEL POOL/CLIENTE EN global.db O global.pgPool
async function getDbPool() {
    // Lista de candidatos donde la aplicación almacena la DB
    const roots = [global.db, global.pgPool];

    for (const root of roots) {
        if (!root) continue;

        // 1. Si la raíz misma tiene el método de consulta SQL
        if (typeof root.query === 'function' || typeof root.execute === 'function') {
            return root;
        }

        // 2. Buscar en Subpropiedades típicas de adaptadores/ORMs (db, pool, client, connection)
        const subKeys = ['db', 'pool', 'client', 'connection', 'postgres', 'pg'];
        for (const key of subKeys) {
            const sub = root[key];
            if (sub) {
                if (typeof sub.query === 'function' || typeof sub.execute === 'function') {
                    return sub;
                }
                // Nivel extra de anidación (ej. global.db.db.pool)
                if (sub.pool && typeof sub.pool.query === 'function') return sub.pool;
                if (sub.client && typeof sub.client.query === 'function') return sub.client;
            }
        }
    }

    // 3. Fallback: Inspección profunda de todas las llaves de global.db
    if (global.db && typeof global.db === 'object') {
        for (const key of Object.keys(global.db)) {
            const val = global.db[key];
            if (val && typeof val.query === 'function') {
                return val;
            }
        }
    }

    console.error("❌ [DB Error] Se encontró global.db pero no contenía un método .query() reconocido.");
    return null;
}

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
    } catch (e) {}
    return {};
}

function saveSettings(data) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
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

// --- OPERACIONES DE BASE DE DATOS ---

async function executeQuery(sql, params = []) {
    const db = await getDbPool();
    if (!db) {
        console.error("❌ [DB Query] No se pudo encontrar una conexión válida a PostgreSQL.");
        return null;
    }

    try {
        if (typeof db.query === 'function') {
            return await db.query(sql, params);
        } else if (typeof db.execute === 'function') {
            return await db.execute(sql, params);
        }
    } catch (err) {
        console.error("❌ Error ejecutando consulta SQL:", err.message);
        return null;
    }
}

async function ensureTable() {
    await executeQuery(`
        CREATE TABLE IF NOT EXISTS family_relations (
            id SERIAL PRIMARY KEY,
            guild_id VARCHAR(64) NOT NULL,
            u1 VARCHAR(64) NOT NULL,
            u2 VARCHAR(64) NOT NULL,
            type VARCHAR(32) NOT NULL,
            created_at BIGINT NOT NULL
        );
    `);
}

export async function getGuildRelations(guildId) {
    await ensureTable();
    const res = await executeQuery(
        `SELECT u1, u2, type, created_at AS "createdAt" FROM family_relations WHERE guild_id = $1`,
        [guildId]
    );

    if (!res) return [];
    return res.rows || res[0] || [];
}

export async function addRelation(guildId, u1, u2, type) {
    await ensureTable();
    
    const relations = await getGuildRelations(guildId);
    
    const exists = relations.some(r => 
        ((r.u1 === u1 && r.u2 === u2) || (r.u1 === u2 && r.u2 === u1)) &&
        (r.type === type || (type === 'parent_child' && r.type === 'adoption'))
    );

    if (!exists) {
        const res = await executeQuery(
            `INSERT INTO family_relations (guild_id, u1, u2, type, created_at) VALUES ($1, $2, $3, $4, $5)`,
            [guildId, u1, u2, type, Date.now()]
        );

        if (res) {
            console.log(`✅ [BD SUCCESS] Relación guardada: ${u1} -> ${u2} (${type})`);
            return true;
        }
        return false;
    }

    return true;
}

export async function removeRelation(guildId, u1, u2, type) {
    await ensureTable();
    const res = await executeQuery(
        `DELETE FROM family_relations 
         WHERE guild_id = $1 
         AND (type = $2 OR type = 'adoption' OR type = 'parent_child')
         AND ((u1 = $3 AND u2 = $4) OR (u1 = $4 AND u2 = $3))`,
        [guildId, type, u1, u2]
    );
    return Boolean(res);
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
