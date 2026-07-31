export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const nodeWidth = 120;
    const nodeHeight = 46;
    const borderRadius = 8;

    for (const node of nodes) {
        if (node.type === 'union' || node.hidden) continue;

        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        const isRoot = node.isRoot || node.id === layout.family?.userId;

        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        const textColor = isRoot 
            ? (settings.userText || '#ffffff') 
            : (settings.nodeText || '#ffffff');

        const lineColor = settings.lines || '#000000';

        // Dibujar contenedor del nodo
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, nodeWidth, nodeHeight, borderRadius);
        } else {
            ctx.rect(x, y, nodeWidth, nodeHeight);
        }

        ctx.fillStyle = bgColor;
        ctx.fill();

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Dibujar el nombre centrado en la tarjeta
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = 'bold 13px Sans-Serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayName = node.name || node.username || 'Usuario';
        const truncatedName = displayName.length > 13 
            ? displayName.substring(0, 11) + '...' 
            : displayName;

        ctx.fillText(truncatedName, node.x, node.y);
        ctx.restore();
    }
}
