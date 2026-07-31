const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; 
const HORIZONTAL_GAP = 90;
const VERTICAL_GAP = 80;

export async function calculateLayout(guild, family) {
    const rootId = family.userId || family.targetUser;
    const direction = family.settings?.direction || 'TB';

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

    if (direction === 'TB') {
        const partners = [...spouseIds, ...loverIds];
        const level1Nodes = [rootNode];
        for (const pId of partners) {
            const pNode = nodesMap.get(pId);
            if (pNode && !level1Nodes.includes(pNode)) level1Nodes.push(pNode);
        }

        const totalL1Width = level1Nodes.length * NODE_WIDTH + (level1Nodes.length - 1) * HORIZONTAL_GAP;
        let startX = -totalL1Width / 2;

        level1Nodes.forEach((node) => {
            node.x = startX;
            node.y = 0;
            startX += NODE_WIDTH + HORIZONTAL_GAP;
        });

        const level0Nodes = parentIds.map(id => nodesMap.get(id)).filter(Boolean);
        if (level0Nodes.length === 1) {
            level0Nodes[0].x = rootNode.x;
            level0Nodes[0].y = -(NODE_HEIGHT + VERTICAL_GAP);
        } else if (level0Nodes.length > 0) {
            const totalL0Width = level0Nodes.length * NODE_WIDTH + (level0Nodes.length - 1) * HORIZONTAL_GAP;
            let startX0 = -totalL0Width / 2;
            level0Nodes.forEach((node) => {
                node.x = startX0;
                node.y = -(NODE_HEIGHT + VERTICAL_GAP);
                startX0 += NODE_WIDTH + HORIZONTAL_GAP;
            });
        }

        const level2Nodes = childIds.map(id => nodesMap.get(id)).filter(Boolean);
        if (level2Nodes.length > 0) {
            const totalL2Width = level2Nodes.length * NODE_WIDTH + (level2Nodes.length - 1) * HORIZONTAL_GAP;
            let startX2 = -totalL2Width / 2;
            level2Nodes.forEach((node) => {
                node.x = startX2;
                node.y = (NODE_HEIGHT + VERTICAL_GAP);
                startX2 += NODE_WIDTH + HORIZONTAL_GAP;
            });
        }
    }

    // Conexiones de padres
    if (parentIds.length > 0) {
        if (parentIds.length === 1) {
            connections.push({
                fromNodeId: parentIds[0],
                toNodeId: rootNode.id,
                type: 'parent-child-direct'
            });
        }
    }

    // Conexión de pareja unificada (en lugar de una por cada cónyuge suelto)
    const partners = [...spouseIds, ...loverIds];
    if (partners.length > 0) {
        connections.push({
            fromNodeId: rootNode.id,
            partnerIds: partners,
            type: 'partners-group'
        });
    }

    // Conexiones de hijos
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
