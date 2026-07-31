import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta donde se guardarán permanentemente las relaciones
const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'families.json');

// Crear la carpeta /data si no existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Cargar los datos desde el archivo de disco al iniciar
function loadStorage() {
    try {
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error('Error cargando families.json:', error);
    }
    return {};
}

// Guardar los datos actuales en el archivo de disco
function saveStorage(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error guardando en families.json:', error);
        return false;
    }
}

/**
 * Obtiene todas las relaciones de un servidor.
 */
export async function getGuildRelations(guildId) {
    const store = loadStorage();
    if (!store[guildId]) {
        store[guildId] = [];
    }
    return store[guildId];
}

/**
 * Guarda las relaciones de un servidor.
 */
export async function saveGuildRelations(guildId, relations) {
    const store = loadStorage();
    store[guildId] = relations;
    return saveStorage(store);
}

/**
 * Añade una nueva relación entre dos usuarios.
 */
export async function addRelation(guildId, u1, u2, type) {
    const relations = await getGuildRelations(guildId);
    
    // Evitar duplicados
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

/**
 * Elimina una relación específica entre dos usuarios.
 */
export async function removeRelation(guildId, u1, u2, type) {
    let relations = await getGuildRelations(guildId);
    
    relations = relations.filter(rel => {
        const isTargetType = rel.type === type || (type === 'parent_child' && rel.type === 'adoption');
        const isMatch = (rel.u1 === u1 && rel.u2 === u2) || (rel.u1 === u2 && rel.u2 === u1);
        return !(isTargetType && isMatch);
    });

    await saveGuildRelations(guildId, relations);
    return true;
}

/**
 * Obtiene la información familiar consolidada de un usuario.
 */
export async function getUserFamilyData(guildId, userId) {
    const relations = await getGuildRelations(guildId);
    
    let spouses = [];
    let parents = [];
    let children = [];
    let siblings = [];
    let lovers = [];

    for (const rel of relations) {
        // Matrimonio / Pareja
        if (rel.type === 'marriage') {
            if (rel.u1 === userId) spouses.push(rel.u2);
            else if (rel.u2 === userId) spouses.push(rel.u1);
        } 
        // Hijos (Acepta tanto 'parent_child' como 'adoption')
        else if (rel.type === 'parent_child' || rel.type === 'adoption') {
            if (rel.u2 === userId) parents.push(rel.u1);
            if (rel.u1 === userId) children.push(rel.u2);
        } 
        // Hermanos
        else if (rel.type === 'sibling') {
            if (rel.u1 === userId) siblings.push(rel.u2);
            else if (rel.u2 === userId) siblings.push(rel.u1);
        } 
        // Amantes
        else if (rel.type === 'lover') {
            if (rel.u1 === userId) lovers.push(rel.u2);
            else if (rel.u2 === userId) lovers.push(rel.u1);
        }
    }

    // Incluir parejas de los padres (padrastros / madrastras)
    const allParents = new Set(parents);
    for (const parentId of parents) {
        for (const rel of relations) {
            if (rel.type === 'marriage') {
                if (rel.u1 === parentId && rel.u2 !== userId) {
                    allParents.add(rel.u2);
                } else if (rel.u2 === parentId && rel.u1 !== userId) {
                    allParents.add(rel.u1);
                }
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
