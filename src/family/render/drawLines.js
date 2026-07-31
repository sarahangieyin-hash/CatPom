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
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) continue;

            // Coordenada X exacta del espacio libre entre el borde derecho de un nodo y el izquierdo del otro
            const rightOfFrom = fromNode.x + NODE_WIDTH;
            const leftOfTo = toNode.x;
            const midX = (rightOfFrom + leftOfTo) / 2;
            
            // Coordenada Y exacta de la mitad de la altura de las tarjetas para que quede centrado verticalmente
            const midY = fromNode.y + (NODE_HEIGHT / 2);

            if (ringImage) {
                const iconSize = 30;
                // Dibujar centrado milimétricamente en el espacio libre
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
        else if (conn.type === 'family-child') {
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
