import { fonts } from './fonts.js';

export async function drawNodes(ctx, layout) {
    const { nodes, settings } = layout;
    const minWidth = 100;    // Ancho mínimo para que no queden micro-tarjetas en nombres muy cortos
    const nodeHeight = 46;   // El alto se mantiene fijo
    const paddingX = 24;     // Margen interno horizontal (espacio a los lados del texto)
    const radius = 10;

    for (const node of nodes) {
        if (node.type === 'union' || node.hidden) continue;

        const isRoot = node.isRoot || node.id === layout.family?.userId;

        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        const textColor = '#ffffff';
        const lineColor = settings.lines || '#ffffff';

        const name = String(node.name || node.username || `User ${String(node.id || '').slice(-4)}`);

        // 1. Configurar la fuente primero para medir con precisión
        ctx.save();
        ctx.font = fonts.name || 'bold 13px "DejaVuSans"';

        // 2. Calcular el ancho dinámico según el texto
        const textMetrics = ctx.measureText(name);
        const calculatedWidth = textMetrics.width + paddingX;
        const nodeWidth = Math.max(minWidth, calculatedWidth); // Se expande horizontalmente si el nombre es largo

        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        // 3. Dibujar recuadro de la tarjeta con el nuevo ancho
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

        // 4. Renderizar el texto completo centrado
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, node.x, node.y);

        ctx.restore();
    }
}
