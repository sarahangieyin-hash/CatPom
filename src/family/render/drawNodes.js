// Función para limpiar fuentes decorativas Unicode y emojis que causan cuadraditos en Canvas
function sanitizeDisplayName(str) {
    if (!str) return 'Usuario';
    
    // Normalizar texto Unicode (convierte letras especiales/estéticas a caracteres latinos estándar)
    let cleaned = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remover emojis y símbolos especiales que Canvas en Linux no puede renderizar
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    // Dejar solo caracteres visibles estándar (letras, números, espacios y signos básicos)
    cleaned = cleaned.replace(/[^a-zA-Z0-9 _\-.\u00C0-\u017F]/g, '').trim();

    return cleaned || 'Usuario';
}

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

        // Colores de fondo
        const bgColor = isRoot 
            ? (settings.userBg || '#1d4ed8') 
            : (settings.nodeBg || '#111111');

        // Color de borde y texto siempre visible (Blanco por defecto)
        const lineColor = settings.lines || '#ffffff';
        const textColor = '#ffffff';

        // 1. DIBUJAR TARJETA CON BORDES REDONDEADOS
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

        // 2. DIBUJAR TEXTO LIMPIO Y VISIBLE
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra de texto ligera para mejorar contraste
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;

        const rawName = node.name || node.username || `User ${String(node.id || '').slice(-4)}`;
        const cleanName = sanitizeDisplayName(rawName);
        
        const truncatedName = cleanName.length > 12 
            ? cleanName.substring(0, 10) + '...' 
            : cleanName;

        ctx.fillText(truncatedName, node.x, node.y);
        ctx.restore();
    }
}
