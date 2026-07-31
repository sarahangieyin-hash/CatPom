import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'families.json');
const settingsPath = path.join(dataDir, 'tree_settings.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function loadStorage(file) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (error) {
        console.error(`Error cargando ${file}:`, error);
    }
    return {};
}

function saveStorage(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error guardando en ${file}:`, error);
        return false;
    }
}

// Configuración por defecto para el árbol
export const DEFAULT_TREE_SETTINGS = {
    userBg: '#1d4ed8',      // Color caja del usuario principal (Azul)
    userText: '#ffffff',    // Color texto del usuario principal
    nodeBg: '#111111',      // Color cajas normales (Negro)
    nodeText: '#ffffff',    // Color texto cajas normales
    lines: '#000000',       // Color de las líneas de unión
    background: '#ffffff', // Color de fondo del árbol
    direction: 'TB'        // TB = Top-Bottom (Arriba a Abajo), LR = Left-Right (Izquierda a Derecha)
};

/**
 * Obtener la configuración visual del árbol para un usuario o servidor
 */
export async function getTreeSettings(userId) {
    const settings = loadStorage(settingsPath);
    return { ...DEFAULT_TREE_SETTINGS, ...(settings[userId] || {}) };
}

/**
 * Guardar la configuración visual del árbol
 */
export async function saveTreeSettings(userId, newSettings) {
    const settings = loadStorage(settingsPath);
    settings[userId] = { ...(settings[userId] || DEFAULT_TREE_SETTINGS), ...newSettings };
    return saveStorage(settingsPath, settings);
}

/**
 * Relaciones Familiares
 */
export async function getGuildRelations(guildId) {
    const store = loadStorage(filePath);
    return store[guildId] || [];
}

export async function saveGuildRelations(guildId, relations) {
    const store = loadStorage(filePath);
    store[guildId] = relations;
    return saveStorage(filePath, store);
}

export async function addRelation(guildId, u1, u2, type) {
    const relations = await getGuildRelations(guildId);
    const exists = relations.some(r => 
        r.type === type && 
        ((r.u1 === u1 && r.u2 === u2) || (r.u1 === u2 && r.u2 === u1))
    );

    if (!exists) {
        relations.push({ u1, u2, type, createdAt: Date.now() });
        await saveGuildRelations(guildId, relations);
    }
    return true;
}

export async function removeRelation(guildId, u1, u2, type) {
    let relations = await getGuildRelations(guildId);
    relations = relations.filter(rel => {
        const isTargetType = rel.type === type || (type === 'parent_child' && rel.type === 'adoption');
        const isMatch = (rel.u1 === u1 && rel.u2 === u2) || (rel.u1 === u2 && rel.u1 === u1);
        return !(isTargetType && isMatch);
    });
    await saveGuildRelations(guildId, relations);
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
