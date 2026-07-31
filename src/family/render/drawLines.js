import { loadImage } from 'canvas';
import path from 'path';

export async function drawLines(ctx, layout) {
    const { nodes, connections, family } = layout;
    
    if (!connections || !Array.isArray(connections)) return;

    const settings = family.settings || {};
    const lineColor = settings.lineColor || settings.lines || '#000000';
    const direction = settings.direction || 'TB';
    
    const NODE_HEIGHT = 46;
    const NODE_WIDTH = 120;

    let ringImage = null;
    try {
        const ringPath = path.resolve('src/assets/icons/ring.png');
        ringImage = await loadImage(ringPath);
    } catch (e) {
        console.warn('No se pudo cargar el icono ring.png');
    }

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const conn of connections) {
        ctx.beginPath();

        if (conn.type === 'partners-group') {
            const rootNode = nodes.find(n => n.id === conn.fromNodeId);
            if (!rootNode) continue;

            let prevNode = rootNode;
            const midY = rootNode.y + NODE_HEIGHT / 2;

            for (const pId of conn.partnerIds) {
                const pNode = nodes.find(n => n.id === pId);
                if (!pNode) continue;

                const prevCenterX = prevNode.x + NODE_WIDTH / 2;
                const pCenterX = pNode.x + NODE_WIDTH / 2;
                const midX = (prevCenterX + pCenterX) / 2;

                // Línea horizontal entre este par de cónyuges
                ctx.moveTo(prevCenterX, midY);
                ctx.lineTo(pCenterX, midY);
                ctx.stroke();

                // Anillo exactamente en el punto medio entre ellos
                if (ringImage) {
                    const iconSize = 26;
                    ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
                }

                prevNode = pNode;
            }
            continue;
        } 
        else if (conn.type === 'parent-child-direct') {
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) continue;

            if (direction === 'TB') {
                const startX = fromNode.x + NODE_WIDTH / 2;
                const startY = fromNode.y + NODE_HEIGHT;
                const endX = toNode.x + NODE_WIDTH / 2;
                const endY = toNode.y;

                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            }
        }
        else if (conn.type === 'family-child') {
            const rootNode = nodes.find(n => n.isRoot);
            const partnerNode = nodes.find(n => n.id === conn.partnerId);
            const childNode = nodes.find(n => n.id === conn.toNodeId);
            if (!rootNode || !partnerNode || !childNode) continue;

            if (direction === 'TB') {
                const rootCenterX = rootNode.x + NODE_WIDTH / 2;
                const partnerCenterX = partnerNode.x + NODE_WIDTH / 2;
                
                const coupleMidX = (rootCenterX + partnerCenterX) / 2;
                
                const coupleY = rootNode.y + NODE_HEIGHT;
                const childTopY = childNode.y;
                const midY = (coupleY + childTopY) / 2;
                const childCenterX = childNode.x + NODE_WIDTH / 2;

                ctx.moveTo(coupleMidX, coupleY);
                ctx.lineTo(coupleMidX, midY);
                ctx.lineTo(childCenterX, midY);
                ctx.lineTo(childCenterX, childTopY);
            }
        }

        ctx.stroke();
    }

    ctx.restore();
}
