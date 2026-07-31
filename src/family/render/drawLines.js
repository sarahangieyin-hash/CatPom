import { loadImage } from 'canvas';
import path from 'path';

export async function drawLines(ctx, layout) {
    const { nodes, connections, family } = layout;
    
    if (!connections || !Array.isArray(connections)) return;

    const settings = family.settings || {};
    const lineColor = settings.lineColor || settings.lines || '#000000';
    
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

        if (conn.type === 'partner-ring') {
            const { leftNode, rightNode } = conn;
            if (!leftNode || !rightNode) continue;

            // Anillo perfectamente centrado en el pasillo horizontal entre ambas tarjetas
            const midX = (leftNode.x + NODE_WIDTH + rightNode.x) / 2;
            const midY = leftNode.y + (NODE_HEIGHT / 2);

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

            const startX = fromNode.x + NODE_WIDTH / 2;
            const startY = fromNode.y + NODE_HEIGHT;
            const endX = toNode.x + NODE_WIDTH / 2;
            const endY = toNode.y;

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        else if (conn.type === 'family-children-bar') {
            const { leftMost, rightMost, children } = conn;
            if (!leftMost || !rightMost) continue;

            const barStartX = leftMost.x + NODE_WIDTH / 2;
            const barEndX = rightMost.x + NODE_WIDTH / 2;
            
            const level1Y = leftMost.y + NODE_HEIGHT;
            const level2Y = children && children.length > 0 ? children[0].y : (level1Y + 90);
            const barY = (level1Y + level2Y) / 2;
            
            const rootCenterX = nodes.find(n => n.isRoot).x + NODE_WIDTH / 2;

            // Línea vertical que baja desde ti hacia la barra horizontal de hijos
            ctx.moveTo(rootCenterX, level1Y);
            ctx.lineTo(rootCenterX, barY);

            // Barra horizontal de lado a lado cubriendo a todas las parejas
            ctx.moveTo(barStartX, barY);
            ctx.lineTo(barEndX, barY);

            // Bajadas hacia los hijos (o marcas de referencia si hubiera más)
            if (children && children.length > 0) {
                for (const child of children) {
                    const childCenterX = child.x + NODE_WIDTH / 2;
                    ctx.moveTo(childCenterX, barY);
                    ctx.lineTo(childCenterX, child.y);
                }
            }
        }

        ctx.stroke();
    }

    ctx.restore();
}
