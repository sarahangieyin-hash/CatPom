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

            // Centro exacto de la tarjeta 1 y tarjeta 2 (sumando la mitad de su ancho)
            const fromCenterX = fromNode.x + NODE_WIDTH / 2;
            const toCenterX = toNode.x + NODE_WIDTH / 2;
            
            // Punto medio real entre ambos centros
            const midX = (fromCenterX + toCenterX) / 2;
            const midY = (fromNode.y + toNode.y + NODE_HEIGHT) / 2; // Alineado verticalmente al centro de las cajas

            if (ringImage) {
                const iconSize = 26;
                ctx.drawImage(ringImage, midX - iconSize / 2, midY - iconSize / 2, iconSize, iconSize);
            }
            continue; 
        } 
        else if (conn.type === 'parents-couple') {
            const p1 = nodes.find(n => n.id === conn.fromNodeId);
            const p2 = nodes.find(n => n.id === conn.toNodeId);
            if (!p1 || !p2) continue;

            if (direction === 'TB') {
                ctx.moveTo(p1.x + NODE_WIDTH / 2, p1.y + NODE_HEIGHT);
                ctx.lineTo(p2.x + NODE_WIDTH / 2, p2.y + NODE_HEIGHT);
            } else {
                ctx.moveTo(p1.x + NODE_WIDTH, p1.y + NODE_HEIGHT / 2);
                ctx.lineTo(p2.x, p2.y + NODE_HEIGHT / 2);
            }
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
                const startX = fromNode.x + NODE_WIDTH;
                const startY = fromNode.y + NODE_HEIGHT / 2;
                const endX = toNode.x;
                const endY = toNode.y + NODE_HEIGHT / 2;

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
                const p1CenterX = p1.x + NODE_WIDTH / 2;
                const p2CenterX = p2.x + NODE_WIDTH / 2;
                const midX = (p1CenterX + p2CenterX) / 2;
                
                const parentsBottomY = p1.y + NODE_HEIGHT;
                const rootTopY = rootNode.y;
                const midY = (parentsBottomY + rootTopY) / 2;

                const rootCenterX = rootNode.x + NODE_WIDTH / 2;

                ctx.moveTo(midX, parentsBottomY);
                ctx.lineTo(midX, midY);
                ctx.lineTo(rootCenterX, midY);
                ctx.lineTo(rootCenterX, rootTopY);
            }
        }
        else if (conn.type === 'family-child') {
            const rootNode = nodes.find(n => n.isRoot);
            const partnerNode = nodes.find(n => n.id === conn.partnerId);
            const childNode = nodes.find(n => n.id === conn.toNodeId);
            if (!rootNode || !partnerNode || !childNode) continue;

            if (direction === 'TB') {
                // Centros exactos de ti y de tu pareja
                const rootCenterX = rootNode.x + NODE_WIDTH / 2;
                const partnerCenterX = partnerNode.x + NODE_WIDTH / 2;
                
                // Punto medio exacto entre ambos perfiles
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
