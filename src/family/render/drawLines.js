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

            const rightOfLeft = leftNode.x + NODE_WIDTH;
            const leftOfRight = rightNode.x;
            const midX = (rightOfLeft + leftOfRight) / 2;
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
            const barY = leftMost.y + NODE_HEIGHT + 25; // Línea horizontal inferior (la barra de hijos)
            const parentBottomY = leftMost.y + NODE_HEIGHT;
            const rootCenterX = nodes.find(n => n.isRoot).x + NODE_WIDTH / 2;

            // 1. Línea vertical desde el bloque central de padres hacia la barra horizontal inferior
            ctx.moveTo(rootCenterX, parentBottomY);
            ctx.lineTo(rootCenterX, barY);

            // 2. Barra horizontal de lado a lado (como dibujaste en rojo)
            ctx.moveTo(barStartX, barY);
            ctx.lineTo(barEndX, barY);

            // 3. Si hay hijos, baja líneas desde la barra horizontal hasta cada hijo
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
