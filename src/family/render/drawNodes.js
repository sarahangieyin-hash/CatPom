import { fonts } from './fonts.js';

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

        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        const textColor = '#ffffff';
        const lineColor = settings.lines || '#ffffff';

        // 1. Dibujar la tarjeta redondeada
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

        // 2. Dibujar el texto limpio
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = fonts.name || 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Obtener el nombre y eliminar caracteres/emojis no soportados por el Canvas del servidor
        let rawName = node.name || node.username || '';
        let cleanName = rawName.replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();

        if (!cleanName) {
            cleanName = `User ${String(node.id || '').slice(-4)}`;
        }

        const displayName = cleanName.length > 12 
            ? cleanName.substring(0, 10) + '...' 
            : cleanName;

        ctx.fillText(displayName, node.x, node.y);
        ctx.restore();
    }
}
