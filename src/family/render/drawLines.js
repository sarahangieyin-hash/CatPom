export async function drawLines(ctx, layout) {
    const { nodes, connections, family } = layout;
    
    if (!connections || !Array.isArray(connections)) return;

    const settings = family.settings || {};
    const lineColor = settings.lineColor || settings.lines || '#000000';
    const direction = settings.direction || 'TB';
    
    const NODE_HEIGHT = 46;
    const NODE_WIDTH = 120;

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const conn of connections) {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId);
        const toNode = nodes.find(n => n.id === conn.toNodeId);

        if (!fromNode || !toNode) continue;

        ctx.beginPath();

        if (conn.type === 'partner') {
            if (direction === 'TB') {
                // Línea horizontal directa entre parejas (Vertical Mode)
                const startX = fromNode.x + (toNode.x > fromNode.x ? NODE_WIDTH / 2 : -NODE_WIDTH / 2);
                const endX = toNode.x + (toNode.x > fromNode.x ? -NODE_WIDTH / 2 : NODE_WIDTH / 2);
                
                ctx.moveTo(startX, fromNode.y);
                ctx.lineTo(endX, toNode.y);
            } else {
                // Línea vertical directa entre parejas (Horizontal Mode)
                const startY = fromNode.y + (toNode.y > fromNode.y ? NODE_HEIGHT / 2 : -NODE_HEIGHT / 2);
                const endY = toNode.y + (toNode.y > fromNode.y ? -NODE_HEIGHT / 2 : NODE_HEIGHT / 2);
                
                ctx.moveTo(fromNode.x, startY);
                ctx.lineTo(toNode.x, endY);
            }
        } else {
            // Conexión Padres e Hijos
            if (direction === 'TB') {
                const startX = fromNode.x;
                const startY = fromNode.y + NODE_HEIGHT / 2;
                const endX = toNode.x;
                const endY = toNode.y - NODE_HEIGHT / 2;
                const midY = (startY + endY) / 2;

                ctx.moveTo(startX, startY);
                ctx.lineTo(startX, midY);
                ctx.lineTo(endX, midY);
                ctx.lineTo(endX, endY);
            } else {
                const startX = fromNode.x + NODE_WIDTH / 2;
                const startY = fromNode.y;
                const endX = toNode.x - NODE_WIDTH / 2;
                const endY = toNode.y;
                const midX = (startX + endX) / 2;

                ctx.moveTo(startX, startY);
                ctx.lineTo(midX, startY);
                ctx.lineTo(midX, endY);
                ctx.lineTo(endX, endY);
            }
        }

        ctx.stroke();
    }

    ctx.restore();
}
