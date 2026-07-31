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

        if (conn.type === 'partner') {
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) continue;

            // Centros exactos de ambos nodos de la pareja
            const fromCenterX = fromNode.x + NODE_WIDTH / 2;
            const toCenterX = toNode.x + NODE_WIDTH / 2;
            
            // Punto medio exacto entre ambos perfiles
            const midX = (fromCenterX + toCenterX) / 2;
            const midY = fromNode.y + NODE_HEIGHT / 2;

            if (ringImage) {
                const iconSize = 28;
                ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
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
                
                // Punto medio exacto entre ti y tu pareja
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
