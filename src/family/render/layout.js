const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; 
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 90;

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
    const siblingIds = family.siblings || [];
    const childIds = family.children || [];

    for (const id of parentIds) await addNode(id, 0);
    for (const id of siblingIds) await addNode(id, 1);
    for (const id of spouseIds) await addNode(id, 1);
    for (const id of loverIds) await addNode(id, 1);
    for (const id of childIds) await addNode(id, 2);

    // --- FILA 1 (CENTRAL): Tú, Parejas y Hermanos ordenados horizontalmente ---
    const level1Ids = [rootNode.id, ...siblingIds, ...spouseIds, ...loverIds];
    // Eliminar duplicados si los hubiera
    const uniqueLevel1 = [...new Set(level1Ids)];
    
    const totalWidth = uniqueLevel1.length * NODE_WIDTH + (uniqueLevel1.length - 1) * HORIZONTAL_GAP;
    let startX = -totalWidth / 2;

    uniqueLevel1.forEach((id) => {
        const node = nodesMap.get(id);
        if (node) {
            node.x = startX;
            node.y = 0;
            startX += NODE_WIDTH + HORIZONTAL_GAP;
        }
    });

    // --- FILA 0 (PADRES): Arriba ---
    const level0Nodes = parentIds.map(id => nodesMap.get(id)).filter(Boolean);
    if (level0Nodes.length > 0) {
        let startX0 = -((level0Nodes.length * NODE_WIDTH + (level0Nodes.length - 1) * HORIZONTAL_GAP) / 2);
        level0Nodes.forEach((node) => {
            node.x = startX0;
            node.y = -(NODE_HEIGHT + VERTICAL_GAP);
            startX0 += NODE_WIDTH + HORIZONTAL_GAP;
        });
    }

    // --- FILA 2 (HIJOS): Abajo ---
    const level2Nodes = childIds.map(id => nodesMap.get(id)).filter(Boolean);
    if (level2Nodes.length > 0) {
        let startX2 = -((level2Nodes.length * NODE_WIDTH + (level2Nodes.length - 1) * HORIZONTAL_GAP) / 2);
        level2Nodes.forEach((node) => {
            node.x = startX2;
            node.y = (NODE_HEIGHT + VERTICAL_GAP);
            startX2 += NODE_WIDTH + HORIZONTAL_GAP;
        });
    }

    // --- CONEXIONES ---
    parentIds.forEach(pId => {
        connections.push({
            fromNodeId: pId,
            toNodeId: rootNode.id,
            type: 'parent-child-direct'
        });
    });

    const allPartners = [...spouseIds, ...loverIds];
    allPartners.forEach(pId => {
        connections.push({
            fromNodeId: rootNode.id,
            toNodeId: pId,
            type: 'partner'
        });
    });

    childIds.forEach(cId => {
        connections.push({
            fromNodeId: rootNode.id,
            toNodeId: cId,
            type: 'family-child',
            partnerId: allPartners[0] || null
        });
    });

    return {
        nodes: Array.from(nodesMap.values()),
        connections,
        family
    };
}
