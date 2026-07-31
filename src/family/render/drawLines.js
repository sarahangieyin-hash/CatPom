export async function drawLines(ctx, layout) {
    const { connections, settings } = layout;
    
    // Si no hay conexiones definidas en layout, no dibuja nada
    if (!connections || !Array.isArray(connections)) return;

    // Tomar el color configurado en "lines"
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

        // Si la línea tiene un punto medio/curva (camino ortogonal)
        if (conn.points && Array.isArray(conn.points)) {
            for (const pt of conn.points) {
                ctx.lineTo(pt.x, pt.y);
            }
        } else {
            // Línea recta estándar
            ctx.lineTo(conn.to.x, conn.to.y);
        }

        ctx.stroke();
    }

    ctx.restore();
}
