export async function drawLines(ctx, layout) {
    const nodes = layout.nodes;
    if (!nodes || nodes.length === 0) return;

    const settings = layout.settings || {};
    const lineColor = settings.lines || '#4b5563';

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. DIBUJAR LÍNEA DE MATRIMONIO / PAREJA PRINCIPAL 💍
    const memberNodes = nodes.filter(n => n.type === 'member');
    const unionNode = nodes.find(n => n.type === 'union');

    if (memberNodes.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(memberNodes[0].x, memberNodes[0].y);
        ctx.lineTo(memberNodes[1].x, memberNodes[1].y);
        ctx.stroke();
    }

    // 2. CONEXIONES DE HIJOS 👶
    const childrenNodes = nodes.filter(n => n.type === 'child');

    if (childrenNodes.length > 0) {
        const parentOrigin = unionNode || memberNodes[0];

        if (parentOrigin) {
            const firstChildY = childrenNodes[0].y;
            const midY = parentOrigin.y + (firstChildY - parentOrigin.y) / 2;

            ctx.beginPath();
            ctx.moveTo(parentOrigin.x, parentOrigin.y);
            ctx.lineTo(parentOrigin.x, midY);
            ctx.stroke();

            childrenNodes.forEach(child => {
                ctx.beginPath();
                ctx.moveTo(parentOrigin.x, midY);
                ctx.lineTo(child.x, midY);
                ctx.lineTo(child.x, child.y - 23);
                ctx.stroke();
            });
        }
    }

    // 3. CONEXIONES DE PADRES 👨‍👩‍👧
    const parentNodes = nodes.filter(n => n.type === 'parent');
    const rootUserNode = memberNodes[0];

    if (parentNodes.length > 0 && rootUserNode) {
        const midY = rootUserNode.y - (rootUserNode.y - parentNodes[0].y) / 2;

        ctx.beginPath();
        ctx.moveTo(rootUserNode.x, rootUserNode.y);
        ctx.lineTo(rootUserNode.x, midY);
        ctx.stroke();

        parentNodes.forEach(parent => {
            ctx.beginPath();
            ctx.moveTo(rootUserNode.x, midY);
            ctx.lineTo(parent.x, midY);
            ctx.lineTo(parent.x, parent.y + 23);
            ctx.stroke();
        });
    }

    // 4. CONEXIONES DE AMANTES 💖 (Línea punteada)
    const loversNodes = nodes.filter(n => n.type === 'lover');
    if (loversNodes.length > 0 && rootUserNode) {
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#ec4899';

        loversNodes.forEach(lover => {
            ctx.beginPath();
            ctx.moveTo(rootUserNode.x, rootUserNode.y);
            ctx.lineTo(lover.x, lover.y);
            ctx.stroke();
        });

        ctx.restore();
    }
}
