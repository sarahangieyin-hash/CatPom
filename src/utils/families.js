import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 🎯 EXTRACTOR MULTI-CAPA PARA global.db
async function getDbPool() {
    const candidates = [
        global.db,
        global.pgPool,
        global.db?.db,
        global.db?.pool,
        global.db?.client,
        global.db?.connection,
        global.db?.pg
    ];

    for (const cand of candidates) {
        if (!cand) continue;

        // 1. Método directo de consulta
        if (typeof cand.query === 'function') return { instance: cand, method: 'query' };
        if (typeof cand.execute === 'function') return { instance: cand, method: 'execute' };
        if (typeof cand.run === 'function') return { instance: cand, method: 'run' };
        if (typeof cand.sql === 'function') return { instance: cand, method: 'sql' };

        // 2. Subpropiedad pool/client/db dentro del candidato
        if (cand.pool && typeof cand.pool.query === 'function') return { instance: cand.pool, method: 'query' };
        if (cand.client && typeof cand.client.query === 'function') return { instance: cand.client, method: 'query' };
        if (cand.db && typeof cand.db.query === 'function') return { instance: cand.db, method: 'query' };
    }

    // 3. Si llega aquí, inspeccionamos qué métodos tiene global.db para dar con el correcto
    if (global.db) {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(global.db))
            .concat(Object.keys(global.db))
            .filter(k => typeof global.db[k] === 'function');

        console.error("🔍 [DB DIAGNÓSTICO] Métodos disponibles en global.db:", methods);
    }

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
    const target = await getDbPool();
    if (!target) {
        console.error("❌ [DB Query] No se pudo obtener una instancia válida de PostgreSQL.");
        return null;
    }

    try {
        const { instance, method } = target;
        return await instance[method](sql, params);
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
    return res.rows || res[0] || res || [];
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
            console.log(`✅ [BD SUCCESS] Relación guardada exitosamente: ${u1} -> ${u2} (${type})`);
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
