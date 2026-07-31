import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 🎯 BÚSQUEDA DINÁMICA DEL MÓDULO DE BASE DE DATOS POSTGRESQL
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
                console.log(`✅ [families.js] Módulo de BD conectado con éxito desde: ${dbPath}`);
                break;
            }
        } catch (e) {
            // Continúa buscando la ruta correcta
        }
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
        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }
    } catch (e) {
        console.error("Error al cargar tree_settings.json:", e);
    }
    return {};
}

function saveSettings(data) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error al guardar tree_settings.json:", e);
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

// --- BASE DE DATOS POSTGRESQL ---

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
        console.log("✅ [PostgreSQL] Tabla 'family_relations' lista y sincronizada.");
        return true;
    } catch (err) {
        console.error("❌ [PostgreSQL] Error al crear/conectar la tabla family_relations:", err);
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
        console.error("❌ ERROR LEYENDO RELACIONES DE POSTGRES:", e);
        return [];
    }
}

export async function addRelation(guildId, u1, u2, type) {
    const relations = await getGuildRelations(guildId);
    
    const exists = relations.some(r => 
        (r.type === type || (type === 'parent_child' && r.type === 'adoption')) && 
        ((r.u1 === u1 && r.u2 === u2) || (r.u1 === u2 && r.u2 === u1))
    );

    if (!exists && pgPool) {
        try {
            await pgPool.query(
                `INSERT INTO family_relations (guild_id, u1, u2, type, created_at) VALUES ($1, $2, $3, $4, $5)`,
                [guildId, u1, u2, type, Date.now()]
            );
        } catch (e) {
            console.error("❌ ERROR GUARDANDO RELACIÓN EN POSTGRES:", e);
        }
    }
    return true;
}

export async function removeRelation(guildId, u1, u2, type) {
    if (pgPool) {
        try {
            await pgPool.query(
                `DELETE FROM family_relations 
                 WHERE guild_id = $1 
                 AND (type = $2 OR type = 'adoption' OR type = 'parent_child')
                 AND ((u1 = $3 AND u2 = $4) OR (u1 = $4 AND u2 = $3))`,
                [guildId, type, u1, u2]
            );
        } catch (e) {
            console.error("❌ ERROR ELIMINANDO RELACIÓN EN POSTGRES:", e);
        }
    }

    return true;
}

export async function getUserFamilyData(guildId, userId) {
    const relations = await getGuildRelations(guildId);
    
    let spouses = [];
    let parents = [];
    let children = [];
    let siblings = [];
    let lovers = [];

    for (const rel of relations) {
        if (rel.type === 'marriage') {
            if (rel.u1 === userId) spouses.push(rel.u2);
            else if (rel.u2 === userId) spouses.push(rel.u1);
        } else if (rel.type === 'parent_child' || rel.type === 'adoption') {
            if (rel.u2 === userId) parents.push(rel.u1);
            if (rel.u1 === userId) children.push(rel.u2);
        } else if (rel.type === 'sibling') {
            if (rel.u1 === userId) siblings.push(rel.u2);
            else if (rel.u2 === userId) siblings.push(rel.u1);
        } else if (rel.type === 'lover') {
            if (rel.u1 === userId) lovers.push(rel.u2);
            else if (rel.u2 === userId) lovers.push(rel.u1);
        }
    }

    const allParents = new Set(parents);
    for (const parentId of parents) {
        for (const rel of relations) {
            if (rel.type === 'marriage') {
                if (rel.u1 === parentId && rel.u2 !== userId) allParents.add(rel.u2);
                else if (rel.u2 === parentId && rel.u1 !== userId) allParents.add(rel.u1);
            }
        }
    }

    return {
        userId,
        spouses: Array.from(new Set(spouses)),
        parents: Array.from(allParents),
        children: Array.from(new Set(children)),
        siblings: Array.from(new Set(siblings)),
        lovers: Array.from(new Set(lovers))
    };
}
