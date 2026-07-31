import { QuickDB } from 'quick.db';
const db = new QuickDB();

/**
 * Obtiene todas las relaciones de un servidor.
 */
export async function getGuildRelations(guildId) {
    try {
        const data = await db.get(`family_${guildId}_relations`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error obteniendo relaciones familiares:', error);
        return [];
    }
}

/**
 * Guarda las relaciones de un servidor.
 */
export async function saveGuildRelations(guildId, relations) {
    try {
        await db.set(`family_${guildId}_relations`, relations);
        return true;
    } catch (error) {
        console.error('Error guardando relaciones familiares:', error);
        return false;
    }
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
        const isTargetType = rel.type === type;
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
        if (rel.type === 'marriage') {
            if (rel.u1 === userId) spouses.push(rel.u2);
            else if (rel.u2 === userId) spouses.push(rel.u1);
        } else if (rel.type === 'parent_child') {
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

    // Incluir automáticamente a las parejas de tus padres como parte de tus padres
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
        spouses: Array.from(new Set(spouses)),
        parents: Array.from(allParents),
        children: Array.from(new Set(children)),
        siblings: Array.from(new Set(siblings)),
        lovers: Array.from(new Set(lovers))
    };
}
