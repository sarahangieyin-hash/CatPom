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
            // u1 es el padre/madre, u2 es el hijo/a
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

    // 👨‍👩‍👦 Lógica extendida de padres:
    // Si tus padres directos están casados con alguien más, añadimos a esas parejas a tu lista de padres/madrastras.
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
        parents: Array.from(allParents), // Incluye padres directos + sus parejas (padrastros/madrastras)
        children: Array.from(new Set(children)),
        siblings: Array.from(new Set(siblings)),
        lovers: Array.from(new Set(lovers))
    };
}
