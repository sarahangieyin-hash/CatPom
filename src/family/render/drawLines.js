export async function drawLines(ctx, layout) {
    const { connections, settings } = layout;
    
    if (!connections || !Array.isArray(connections)) return;

    const lineColor = settings.lines || '#000000';

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const conn of connections) {
        if (!conn.from || !conn.to) continue;

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);

        if (conn.points && Array.isArray(conn.points)) {
            for (const pt of conn.points) {
                ctx.lineTo(pt.x, pt.y);
            }
        } else {
            ctx.lineTo(conn.to.x, conn.to.y);
        }

        ctx.stroke();
    }

    ctx.restore();
}
