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

    // Cargar el icono de pareja (anillo)
    let ringImage = null;
    try {
        const ringPath = path.resolve('src/assets/icons/ring.png');
        ringImage = await loadImage(ringPath);
    } catch (e) {
        console.warn('No se pudo cargar el icono ring.png, se omitirá el icono de pareja.');
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

            if (direction === 'TB') {
                // Dibujar línea corta de unión o dejar espacio para el icono en el centro
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                ctx.moveTo(fromNode.x + (toNode.x > fromNode.x ? NODE_WIDTH / 2 : -NODE_WIDTH / 2), fromNode.y);
                ctx.lineTo(toNode.x + (toNode.x > fromNode.x ? -NODE_WIDTH / 2 : NODE_WIDTH / 2), toNode.y);
                ctx.stroke();

                // Pintar el icono del anillo en el centro exacto de la pareja
                if (ringImage) {
                    const iconSize = 24;
                    ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
                }
            } else {
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                ctx.moveTo(fromNode.x, fromNode.y + (toNode.y > fromNode.y ? NODE_HEIGHT / 2 : -NODE_HEIGHT / 2));
                ctx.lineTo(toNode.x, toNode.y + (toNode.y > fromNode.y ? -NODE_HEIGHT / 2 : NODE_HEIGHT / 2));
                ctx.stroke();

                if (ringImage) {
                    const iconSize = 24;
                    ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
                }
            }
            continue; // Evita el stroke general al final para este tipo
        } 
        else if (conn.type === 'parents-couple') {
            const p1 = nodes.find(n => n.id === conn.fromNodeId);
            const p2 = nodes.find(n => n.id === conn.toNodeId);
            if (!p1 || !p2) continue;

            if (direction === 'TB') {
                ctx.moveTo(p1.x + NODE_WIDTH / 2, p1.y);
                ctx.lineTo(p2.x - NODE_WIDTH / 2, p2.y);
            } else {
                ctx.moveTo(p1.x, p1.y + NODE_HEIGHT / 2);
                ctx.lineTo(p2.x, p2.y - NODE_HEIGHT / 2);
            }
        }
        else if (conn.type === 'parent-child-direct') {
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) continue;

            if (direction === 'TB') {
                const startX = fromNode.x;
                const startY = fromNode.y + NODE_HEIGHT / 2;
                const endX = toNode.x;
                const endY = toNode.y - NODE_HEIGHT / 2;

                if (Math.abs(startX - endX) < 5) {
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                } else {
                    const midY = (startY + endY) / 2;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX, midY);
                    ctx.lineTo(endX, midY);
                    ctx.lineTo(endX, endY);
                }
            } else {
                const startX = fromNode.x + NODE_WIDTH / 2;
                const startY = fromNode.y;
                const endX = toNode.x - NODE_WIDTH / 2;
                const endY = toNode.y;

                if (Math.abs(startY - endY) < 5) {
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                } else {
                    const midX = (startX + endX) / 2;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(midX, startY);
                    ctx.lineTo(midX, endY);
                    ctx.lineTo(endX, endY);
                }
            }
        }
        else if (conn.type === 'parent-child-dual') {
            const p1 = nodes.find(n => n.id === conn.parents[0]);
            const p2 = nodes.find(n => n.parents[1]);
            const rootNode = nodes.find(n => n.isRoot);
            if (!p1 || !p2 || !rootNode) continue;

            if (direction === 'TB') {
                const midX = (p1.x + p2.x) / 2;
                const parentsBottomY = p1.y + NODE_HEIGHT / 2;
                const rootTopY = rootNode.y - NODE_HEIGHT / 2;
                const midY = (parentsBottomY + rootTopY) / 2;

                ctx.moveTo(midX, parentsBottomY);
                ctx.lineTo(midX, midY);
                ctx.lineTo(rootNode.x, midY);
                ctx.lineTo(rootNode.x, rootTopY);
            }
        }
        else if (conn.type === 'family-child') {
            const rootNode = nodes.find(n => n.isRoot);
            const partnerNode = nodes.find(n => n.id === conn.partnerId);
            const childNode = nodes.find(n => n.id === conn.toNodeId);
            if (!rootNode || !partnerNode || !childNode) continue;

            if (direction === 'TB') {
                const coupleMidX = (rootNode.x + partnerNode.x) / 2;
                const coupleY = rootNode.y + NODE_HEIGHT / 2;
                const childTopY = childNode.y - NODE_HEIGHT / 2;
                const midY = (coupleY + childTopY) / 2;

                ctx.moveTo(coupleMidX, coupleY);
                ctx.lineTo(coupleMidX, midY);
                ctx.lineTo(childNode.x, midY);
                ctx.lineTo(childNode.x, childTopY);
            }
        }

        ctx.stroke();
    }

    ctx.restore();
}
