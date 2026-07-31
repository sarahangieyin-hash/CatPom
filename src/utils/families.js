import { QuickDB } from 'quick.db';
const db = new QuickDB();

/**
 * Obtiene todas las relaciones de la guild
 */
export async function getGuildRelations(guildId) {
    const data = await db.get(`relations_${guildId}`);
    return data || [];
}

/**
 * Guarda el array de relaciones
 */
export async function saveGuildRelations(guildId, relations) {
    await db.set(`relations_${guildId}`, relations);
}

/**
 * Añade una relación atómica entre dos usuarios si no existe previa
 */
export async function addRelation(guildId, user1Id, user2Id, type) {
    const relations = await getGuildRelations(guildId);
    
    const exists = relations.some(r => 
        ((r.u1 === user1Id && r.u2 === user2Id) || (r.u1 === user2Id && r.u2 === user1Id)) && r.type === type
    );

    if (!exists) {
        relations.push({ u1: user1Id, u2: user2Id, type, createdAt: Date.now() });
        await saveGuildRelations(guildId, relations);
    }
}

/**
 * Elimina una relación específica
 */
export async function removeRelation(guildId, user1Id, user2Id, type) {
    let relations = await getGuildRelations(guildId);
    relations = relations.filter(r => 
        !(((r.u1 === user1Id && r.u2 === user2Id) || (r.u1 === user2Id && r.u2 === user1Id)) && r.type === type)
    );
    await saveGuildRelations(guildId, relations);
}

/**
 * Obtiene la vista de la familia de un usuario específico procesando el grafo
 */
export async function getUserFamilyData(guildId, userId) {
    const relations = await getGuildRelations(guildId);

    // 1. Uniones/Parejas
    const spouses = relations
        .filter(r => r.type === 'spouse' && (r.u1 === userId || r.u2 === userId))
        .map(r => r.u1 === userId ? r.u2 : r.u1);

    // 2. Padres (u1 es el padre, u2 es el hijo)
    const parents = relations
        .filter(r => r.type === 'parent_child' && r.u2 === userId)
        .map(r => r.u1);

    // 3. Hijos (u1 es el padre, u2 es el hijo)
    const children = relations
        .filter(r => r.type === 'parent_child' && r.u1 === userId)
        .map(r => r.u2);

    // 4. Hermanos (Tienen al menos un padre común)
    let siblings = [];
    if (parents.length > 0) {
        siblings = relations
            .filter(r => r.type === 'parent_child' && parents.includes(r.u1) && r.u2 !== userId)
            .map(r => r.u2);
        siblings = [...new Set(siblings)];
    }

    // 5. Amantes
    const lovers = relations
        .filter(r => r.type === 'lover' && (r.u1 === userId || r.u2 === userId))
        .map(r => r.u1 === userId ? r.u2 : r.u1);

    return {
        userId,
        spouses,
        parents,
        children,
        siblings,
        lovers,
        rawRelations: relations
    };
}
