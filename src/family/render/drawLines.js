export async function drawLines(ctx, layout) {
    const { nodes, connections, settings } = layout;
    
    if (!connections || !Array.isArray(connections)) return;

    const lineColor = settings.lines || '#000000';
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
            // Línea horizontal directa entre parejas
            const startX = fromNode.x + (toNode.x > fromNode.x ? NODE_WIDTH / 2 : -NODE_WIDTH / 2);
            const endX = toNode.x + (toNode.x > fromNode.x ? -NODE_WIDTH / 2 : NODE_WIDTH / 2);
            
            ctx.moveTo(startX, fromNode.y);
            ctx.lineTo(endX, toNode.y);
        } else {
            // Conexión vertical (Padre / Hijo)
            const startX = fromNode.x;
            const startY = fromNode.y + NODE_HEIGHT / 2;
            const endX = toNode.x;
            const endY = toNode.y - NODE_HEIGHT / 2;

            const midY = (startY + endY) / 2;

            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, midY);
            ctx.lineTo(endX, midY);
            ctx.lineTo(endX, endY);
        }

        ctx.stroke();
    }

    ctx.restore();
}
