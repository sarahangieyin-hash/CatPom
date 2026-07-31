export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const nodeWidth = 120;
    const nodeHeight = 46;
    const radius = 10;

    for (const node of nodes) {
        if (node.type === 'union' || node.hidden) continue;

        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        const isRoot = node.isRoot || node.id === layout.family?.userId;

        // Colores
        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#222222');

        const textColor = '#ffffff';
        const lineColor = settings.lines || '#000000';

        // 1. Dibujar el recuadro del nodo
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + nodeWidth - radius, y);
        ctx.quadraticCurveTo(x + nodeWidth, y, x + nodeWidth, y + radius);
        ctx.lineTo(x + nodeWidth, y + nodeHeight - radius);
        ctx.quadraticCurveTo(x + nodeWidth, y + nodeHeight, x + nodeWidth - radius, y + nodeHeight);
        ctx.lineTo(x + radius, y + nodeHeight);
        ctx.quadraticCurveTo(x, y + nodeHeight, x, y + nodeHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        ctx.fillStyle = bgColor;
        ctx.fill();

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 2. Obtener y preparar el texto
        let rawName = node.name || node.username || '';
        
        // Si el nombre contiene solo emojis o caracteres invisibles que rompen Canvas
        if (!rawName || rawName.trim().length === 0) {
            rawName = `User ${String(node.id || '').slice(-4)}`;
        }

        const displayName = rawName.length > 12 
            ? rawName.substring(0, 10) + '...' 
            : rawName;

        // 3. Renderizado multi-capa del texto para visibilidad máxima
        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Trazo exterior negro por si el fondo y la letra se confunden
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(displayName, node.x, node.y);

        // Relleno blanco
        ctx.fillStyle = textColor;
        ctx.fillText(displayName, node.x, node.y);

        ctx.restore();
    }
}
