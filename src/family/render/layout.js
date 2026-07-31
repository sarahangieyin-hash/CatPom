const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; 

export async function calculateLayout(guild, family) {
    const rootId = family.userId || family.targetUser;

    const fetchUser = async (id) => {
        try {
            const member = await guild.members.fetch(id).catch(() => null);
            if (member) {
                return {
                    id,
                    name: member.displayName || member.user.username,
                    avatar: member.user.displayAvatarURL({ extension: 'png', size: 128 })
                };
            }
        } catch (e) {}
        return { id, name: `User ${id.slice(-4)}`, avatar: null };
    };

    const nodesMap = new Map();
    const connections = [];

    const addNode = async (id, level, isRoot = false) => {
        if (!nodesMap.has(id)) {
            const userData = await fetchUser(id);
            nodesMap.set(id, {
                ...userData,
                level,
                isRoot,
                x: 0,
                y: 0
            });
        }
        return nodesMap.get(id);
    };

    const rootNode = await addNode(rootId, 1, true);

    const parentIds = family.parents || [];
    const spouseIds = family.spouses || [];
    const loverIds = family.lovers || [];
    const childIds = family.children || [];

    for (const id of parentIds) await addNode(id, 0);
    for (const id of spouseIds) await addNode(id, 1);
    for (const id of loverIds) await addNode(id, 1);
    for (const id of childIds) await addNode(id, 2);

    // --- POSICIONAMIENTO GEOMÉTRICO FIJO Y PERFECTO ---
    // Nivel 1 (Centro horizontal = 0)
    rootNode.x = -130; // Tu nodo a la izquierda del centro exacto
    rootNode.y = 0;

    const partners = [...spouseIds, ...loverIds];
    if (partners.length > 0) {
        const partnerNode = nodesMap.get(partners[0]);
        if (partnerNode) {
            partnerNode.x = 130; // Tu pareja a la derecha simétrica
            partnerNode.y = 0;
        }
    }

    // Nivel 0 (Padres - Yissela)
    if (parentIds.length > 0) {
        const parentNode = nodesMap.get(parentIds[0]);
        if (parentNode) {
            parentNode.x = rootNode.x; // Exactamente encima de ti
            parentNode.y = -130;      // Arriba
        }
    }

    // Nivel 2 (Hijos - Mike)
    if (childIds.length > 0) {
        const childNode = nodesMap.get(childIds[0]);
        if (childNode) {
            // Si hay pareja, se centra entre tú y tu pareja (x=0). Si no, debajo de ti.
            childNode.x = partners.length > 0 ? 0 : rootNode.x;
            childNode.y = 130; // Abajo
        }
    }

    // --- CONEXIONES ---
    if (parentIds.length > 0) {
        connections.push({
            fromNodeId: parentIds[0],
            toNodeId: rootNode.id,
            type: 'parent-child-direct'
        });
    }

    partners.forEach(sId => {
        connections.push({
            fromNodeId: rootNode.id,
            toNodeId: sId,
            type: 'partner'
        });
    });

    childIds.forEach(cId => {
        if (partners.length > 0) {
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: cId,
                type: 'family-child',
                partnerId: partners[0]
            });
        } else {
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: cId,
                type: 'parent-child-direct'
            });
        }
    });

    return {
        nodes: Array.from(nodesMap.values()),
        connections,
        family
    };
}
