const NODE_WIDTH = 120;
const NODE_HEIGHT = 46; 
const HORIZONTAL_GAP = 100;
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
    const spouseIds = family.spouse ? [family.spouse] : (family.spouses || []);
    const loverIds = family.lovers || [];
    const childIds = family.children || [];

    for (const id of parentIds) await addNode(id, 0);
    for (const id of spouseIds) await addNode(id, 1);
    for (const id of loverIds) await addNode(id, 1);
    for (const id of childIds) await addNode(id, 2);

    // Distribución simétrica estricta: [Pareja Izquierda] -> [TÚ (CENTRO EXACTO)] -> [Pareja Derecha]
    const leftPartners = [];
    const rightPartners = [...spouseIds, ...loverIds];

    if (rightPartners.length >= 2) {
        leftPartners.push(rightPartners[0]);
        rightPartners.splice(0, 1);
    }

    const level1Nodes = [];
    leftPartners.forEach(id => level1Nodes.push(nodesMap.get(id)));
    level1Nodes.push(rootNode);
    rightPartners.forEach(id => {
        const n = nodesMap.get(id);
        if (n) level1Nodes.push(n);
    });

    const totalWidth = level1Nodes.length * NODE_WIDTH + (level1Nodes.length - 1) * HORIZONTAL_GAP;
    let startX = -totalWidth / 2;

    level1Nodes.forEach((node) => {
        if (node) {
            node.x = startX;
            node.y = 0;
            startX += NODE_WIDTH + HORIZONTAL_GAP;
        }
    });

    // Nivel 0 (Padres): Centrados de forma estricta arriba de ti
    const level0Nodes = parentIds.map(id => nodesMap.get(id)).filter(Boolean);
    if (level0Nodes.length === 1) {
        level0Nodes[0].x = rootNode.x;
        level0Nodes[0].y = -(NODE_HEIGHT + VERTICAL_GAP);
    } else if (level0Nodes.length > 1) {
        let startX0 = -((level0Nodes.length * NODE_WIDTH + (level0Nodes.length - 1) * HORIZONTAL_GAP) / 2);
        level0Nodes.forEach((node) => {
            node.x = startX0;
            node.y = -(NODE_HEIGHT + VERTICAL_GAP);
            startX0 += NODE_WIDTH + HORIZONTAL_GAP;
        });
    }

    // Nivel 2 (Hijos): Distribuidos abajo de forma simétrica
    const level2Nodes = childIds.map(id => nodesMap.get(id)).filter(Boolean);
    if (level2Nodes.length > 0) {
        let startX2 = -((level2Nodes.length * NODE_WIDTH + (level2Nodes.length - 1) * HORIZONTAL_GAP) / 2);
        level2Nodes.forEach((node) => {
            node.x = startX2;
            node.y = (NODE_HEIGHT + VERTICAL_GAP);
            startX2 += NODE_WIDTH + HORIZONTAL_GAP;
        });
    }

    // Conexiones de padres
    parentIds.forEach(pId => {
        connections.push({
            fromNodeId: pId,
            toNodeId: rootNode.id,
            type: 'parent-child-direct'
        });
    });

    // Anillos entre cada par de cónyuges adyacentes
    for (let i = 0; i < level1Nodes.length - 1; i++) {
        connections.push({
            type: 'partner-ring',
            leftNode: level1Nodes[i],
            rightNode: level1Nodes[i + 1]
        });
    }

    // Barra de hijos unificada que abarca desde la primera pareja hasta la última
    if (level1Nodes.length > 0) {
        connections.push({
            type: 'family-children-bar',
            leftMost: level1Nodes[0],
            rightMost: level1Nodes[level1Nodes.length - 1],
            children: level2Nodes
        });
    }

    return {
        nodes: Array.from(nodesMap.values()),
        connections,
        family
    };
}
