export async function drawMarriage(ctx, layout) {
    const { nodes, family } = layout;

    if (!family || (!family.spouses?.length && !family.lovers?.length)) return;

    const rootNode = nodes.find(n => n.isRoot || n.id === family.userId);
    if (!rootNode) return;

    const partnerIds = [...(family.spouses || []), ...(family.lovers || [])];

    ctx.save();
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    partnerIds.forEach(pId => {
        const partnerNode = nodes.find(n => n.id === pId);
        if (partnerNode) {
            const midX = (rootNode.x + partnerNode.x) / 2;
            const midY = (rootNode.y + partnerNode.y) / 2;
            ctx.fillText('❤️', midX, midY);
        }
    });

    ctx.restore();
}

export default drawMarriage;
