const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; // Sincronizado exactamente con el alto del dibujo de las tarjetas
const HORIZONTAL_GAP = 50;
const VERTICAL_GAP = 60;

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

        const totalRowWidth = rowCount * NODE_WIDTH + (rowCount - 1) * HORIZONTAL_GAP;
        const startX = -totalRowWidth / 2 + NODE_WIDTH / 2;
        const yPos = level * (NODE_HEIGHT + VERTICAL_GAP);

        rowNodes.forEach((node, idx) => {
            node.x = startX + idx * (NODE_WIDTH + HORIZONTAL_GAP);
            node.y = yPos;
        });
    });

    // Crear copias de valores de coordenadas sin usar referencias directas mutables
    if (parentIds.length > 0) {
        parentIds.forEach(pId => {
            const pNode = nodesMap.get(pId);
            if (pNode) {
                connections.push({
                    fromNodeId: pNode.id,
                    toNodeId: rootNode.id,
                    type: 'parent-child'
                });

                siblingIds.forEach(sId => {
                    const sNode = nodesMap.get(sId);
                    if (sNode) {
                        connections.push({
                            fromNodeId: pNode.id,
                            toNodeId: sNode.id,
                            type: 'parent-child'
                        });
                    }
                });
            }
        });
    }

    [...spouseIds, ...loverIds].forEach(sId => {
        const sNode = nodesMap.get(sId);
        if (sNode) {
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: sNode.id,
                type: 'partner'
            });
        }
    });

    childIds.forEach(cId => {
        const cNode = nodesMap.get(cId);
        if (cNode) {
            connections.push({
                fromNodeId: rootNode.id,
                toNodeId: cNode.id,
                type: 'parent-child'
            });
        }
    });

    return {
        nodes: Array.from(nodesMap.values()),
        connections,
        family
    };
}
