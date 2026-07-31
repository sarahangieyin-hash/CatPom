export async function drawLines(ctx, layout) {
    const members = layout.nodes.filter(node => node.type === 'member');
    const children = layout.nodes.filter(node => node.type === 'child');
    const parents = layout.nodes.filter(node => node.type === 'parent');
    const siblings = layout.nodes.filter(node => node.type === 'sibling');
    const unions = layout.nodes.filter(node => node.type === 'union');

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    /*
        PADRES 👨‍👩‍👧 -> Conectan con el miembro principal
    */
    if (parents.length && members.length) {
        const main = members[0];
        parents.forEach(parent => {
            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y + 60);
            ctx.lineTo(main.x, main.y - 60);
            ctx.stroke();
        });
    }

    /*
        HIJOS 👶 -> Salen de sus padres o de la unión
    */
    children.forEach(child => {
        let origin = null;

        if (child.parent) {
            origin = members.find(member => member.id === child.parent);
        }
        if (!origin && unions.length) {
            origin = unions[0];
        }
        if (!origin && members.length) {
            origin = members[0];
        }

        if (!origin) return;

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y + 40);
        ctx.lineTo(child.x, child.y - 60);
        ctx.stroke();
    });

    /*
        HERMANOS 👥 -> Conectan con el miembro principal
    */
    if (siblings.length && members.length) {
        const main = members[0];
        siblings.forEach(sibling => {
            ctx.beginPath();
            ctx.moveTo(sibling.x, sibling.y);
            ctx.lineTo(main.x, main.y);
            ctx.stroke();
        });
    }
}
