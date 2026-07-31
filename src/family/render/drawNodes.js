export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const nodeWidth = 100;
    const nodeHeight = 100;
    const borderRadius = 12;

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
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = 'bold 13px Sans-Serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayName = node.name || node.username || 'Usuario';
        const truncatedName = displayName.length > 11 
            ? displayName.substring(0, 9) + '...' 
            : displayName;

        ctx.fillText(truncatedName, node.x, y + nodeHeight - 16);
        ctx.restore();
    }
}
