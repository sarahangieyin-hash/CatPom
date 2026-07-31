const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; 
const HORIZONTAL_GAP = 50;
const VERTICAL_GAP = 60;

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

    const levels = { 0: [], 1: [], 2: [] };
    for (const node of nodesMap.values()) {
        if (!levels[node.level]) levels[node.level] = [];
        levels[node.level].push(node);
    }

    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);

    levelKeys.forEach((level) => {
        const rowNodes = levels[level];
        const rowCount = rowNodes.length;

        if (rowCount === 0) return;

        if (direction === 'TB') {
            const totalRowWidth = rowCount * NODE_WIDTH + (rowCount - 1) * HORIZONTAL_GAP;
            const startX = -totalRowWidth / 2 + NODE_WIDTH / 2;
            const yPos = (level - 1) * (NODE_HEIGHT + VERTICAL_GAP);

            rowNodes.forEach((node, idx) => {
                node.x = startX + idx * (NODE_WIDTH + HORIZONTAL_GAP);
                node.y = yPos;
            });
        } else {
            const totalRowHeight = rowCount * NODE_HEIGHT + (rowCount - 1) * VERTICAL_GAP;
            const startY = -totalRowHeight / 2 + NODE_HEIGHT / 2;
            const xPos = (level - 1) * (NODE_WIDTH + HORIZONTAL_GAP);

            rowNodes.forEach((node, idx) => {
                node.x = xPos;
                node.y = startY + idx * (NODE_HEIGHT + VERTICAL_GAP);
            });
        }
    });

    // Conexiones de Padres según la cantidad
    if (parentIds.length > 0) {
        if (parentIds.length === 1) {
            connections.push({
                fromNodeId: parentIds[0],
                toNodeId: rootNode.id,
                type: 'parent-child-direct'
            });
        } else if (parentIds.length === 2) {
            connections.push({
                fromNodeId: parentIds[0],
                toNodeId: parentIds[1],
                type: 'parents-couple'
            });
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: 'parents-mid',
                type: 'parent-child-dual',
                parents: [parentIds[0], parentIds[1]]
            });
        } else {
            // Si hay 3 o más padres, unimos la fila de padres horizontalmente y el del medio conecta directo con el root
            for (let i = 0; i < parentIds.length - 1; i++) {
                connections.push({
                    fromNodeId: parentIds[i],
                    toNodeId: parentIds[i + 1],
                    type: 'parents-couple'
                });
            }
            // El padre del medio es el índice central
            const midIndex = Math.floor(parentIds.length / 2);
            connections.push({
                fromNodeId: parentIds[midIndex],
                toNodeId: rootNode.id,
                type: 'parent-child-direct'
            });
        }
    }

    // Conexiones de Parejas / Amantes
    const partners = [...spouseIds, ...loverIds];
    partners.forEach(sId => {
        const sNode = nodesMap.get(sId);
        if (sNode) {
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: sNode.id,
                type: 'partner'
            });
        }
    });

    // Conexiones de Hijos (compartidos con la primera pareja o directos)
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
