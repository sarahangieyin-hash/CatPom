export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const nodeWidth = 120;
    const nodeHeight = 120;
    const borderRadius = 12;

    for (const node of nodes) {
        // Ignorar nodos invisibles/auxiliares si existen
        if (node.type === 'union' || node.hidden) continue;

        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        // 1. Determinar si es el usuario principal (Root) o un familiar
        const isRoot = node.isRoot || node.id === layout.family?.userId;

        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        const textColor = isRoot 
            ? (settings.userText || '#ffffff') 
            : (settings.nodeText || '#ffffff');

        // Color de las líneas para el marco/borde (Equivalente a "lines" en ManyChat)
        const lineColor = settings.lines || '#000000';

        // 2. Dibujar la caja con bordes redondeados
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, nodeWidth, nodeHeight, borderRadius);
        } else {
            ctx.rect(x, y, nodeWidth, nodeHeight);
        }

        // Color de fondo
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Color y grosor del borde (Frame)
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // 3. Dibujar Nombre / Texto del usuario
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px Sans-Serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayName = node.name || node.username || 'Usuario';
        // Recortar texto si es muy largo
        const truncatedName = displayName.length > 12 
            ? displayName.substring(0, 10) + '...' 
            : displayName;

        ctx.fillText(truncatedName, node.x, y + nodeHeight - 20);
        ctx.restore();
    }
}
