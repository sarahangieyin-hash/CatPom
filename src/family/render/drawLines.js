export async function drawLines(
    ctx,
    layout
) {

    const members =
        layout.nodes.filter(
            node => node.type === 'member'
        );

    const children =
        layout.nodes.filter(
            node => node.type === 'child'
        );

    const parents =
        layout.nodes.filter(
            node => node.type === 'parent'
        );

    const siblings =
        layout.nodes.filter(
            node => node.type === 'sibling'
        );

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    /*
        PAREJA
    */

    if (members.length >= 2) {

        const left =
            members.reduce((a, b) => a.x < b.x ? a : b);

        const right =
            members.reduce((a, b) => a.x > b.x ? a : b);

        ctx.beginPath();
        ctx.moveTo(left.x + 60, left.y);
        ctx.lineTo(right.x - 60, right.y);
        ctx.stroke();

    }

    /*
        PADRES -> PAREJA
    */

    if (parents.length) {

        const centerMembers =
            members.reduce((s, n) => s + n.x, 0) /
            Math.max(1, members.length);

        parents.forEach(parent => {

            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y + 60);
            ctx.lineTo(parent.x, parent.y + 110);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y + 110);
            ctx.lineTo(centerMembers, members[0].y - 110);
            ctx.stroke();

        });

    }

    /*
        HIJOS
    */

    if (children.length) {

        const centerMembers =
            members.reduce((s, n) => s + n.x, 0) /
            Math.max(1, members.length);

        const branchY =
            members[0].y + 120;

        ctx.beginPath();
        ctx.moveTo(centerMembers, members[0].y + 60);
        ctx.lineTo(centerMembers, branchY);
        ctx.stroke();

        if (children.length > 1) {

            const first =
                children[0];

            const last =
                children[children.length - 1];

            ctx.beginPath();
            ctx.moveTo(first.x, branchY);
            ctx.lineTo(last.x, branchY);
            ctx.stroke();

        }

        for (const child of children) {

            ctx.beginPath();
            ctx.moveTo(child.x, branchY);
            ctx.lineTo(child.x, child.y - 60);
            ctx.stroke();

        }

    }

    /*
        HERMANOS
    */

    if (siblings.length) {

        const member =
            members[0];

        siblings.forEach(sibling => {

            ctx.beginPath();
            ctx.moveTo(sibling.x + 60, sibling.y);
            ctx.lineTo(member.x - 60, member.y);
            ctx.stroke();

        });

    }

}
