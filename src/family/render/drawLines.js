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
            // Dibuja ÚNICAMENTE el anillo entre las dos cajas, SIN LÍNEA HORIZONTAL DE MATRIMONIO
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) continue;

            const rightOfFrom = fromNode.x + NODE_WIDTH;
            const leftOfTo = toNode.x;
            const midX = (rightOfFrom + leftOfTo) / 2;
            const midY = fromNode.y + NODE_HEIGHT / 2;

            if (ringImage) {
                const iconSize = 28;
                ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
            }
            continue;
        } 
        else if (conn.type === 'parent-child-direct') {
            // Línea recta vertical perfecta de la madre al nodo
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
        else if (conn.type === 'family-child') {
            // Línea recta vertical perfecta desde ti (o el centro del matrimonio) hacia el hijo
            const rootNode = nodes.find(n => n.isRoot);
            const childNode = nodes.find(n => n.id === conn.toNodeId);
            if (!rootNode || !childNode) continue;

            const startX = rootNode.x + NODE_WIDTH / 2;
            const startY = rootNode.y + NODE_HEIGHT;
            const childTopY = childNode.y;
            const midY = (startY + childTopY) / 2;
            const childCenterX = childNode.x + NODE_WIDTH / 2;

            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, midY);
            ctx.lineTo(childCenterX, midY);
            ctx.lineTo(childCenterX, childTopY);
        }

        ctx.stroke();
    }

    ctx.restore();
}
