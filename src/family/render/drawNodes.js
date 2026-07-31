import { fonts } from './fonts.js';

export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const minWidth = 100;
    const nodeHeight = 46;
    const paddingX = 24;
    const radius = 8;

    for (const node of nodes) {
        if (node.type === 'union' || node.hidden) continue;

        const isRoot = node.isRoot || node.id === layout.family?.userId;

        // Colores configurados de forma dinámica y separada para usuario y familiares
        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        const textColor = isRoot 
            ? (settings.userText || '#ffffff') 
            : (settings.nodeText || '#ffffff');

        const lineColor = settings.lineColor || '#000000';

        const name = String(node.name || node.username || `User ${String(node.id || '').slice(-4)}`);

        ctx.save();
        ctx.font = fonts.name || 'bold 13px "DejaVuSans"';

        const textMetrics = ctx.measureText(name);
        const calculatedWidth = textMetrics.width + paddingX;
        const nodeWidth = Math.max(minWidth, calculatedWidth);

        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        // Dibujar recuadro de la tarjeta con esquinas redondeadas
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
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Renderizar el texto centrado con su color respectivo
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, node.x, node.y);

        ctx.restore();
    }
}
