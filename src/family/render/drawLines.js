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
        PAREJA 💍
    */

    let unionX = null;
    let unionY = null;


    if (members.length >= 2) {


        const left =
            members.reduce(
                (a, b) =>
                    a.x < b.x ? a : b
            );


        const right =
            members.reduce(
                (a, b) =>
                    a.x > b.x ? a : b
            );


        unionX =
            (left.x + right.x) / 2;


        unionY =
            left.y;



        ctx.beginPath();

        ctx.moveTo(
            left.x + 60,
            left.y
        );

        ctx.lineTo(
            right.x - 60,
            right.y
        );

        ctx.stroke();


    }



    /*
        PADRES -> PAREJA 💍
    */

    if (
        parents.length &&
        members.length
    ) {


        const targetX =
            unionX ??
            members[0].x;


        parents.forEach(parent => {


            ctx.beginPath();

            ctx.moveTo(
                parent.x,
                parent.y + 60
            );


            ctx.lineTo(
                parent.x,
                parent.y + 110
            );

            ctx.stroke();



            ctx.beginPath();

            ctx.moveTo(
                parent.x,
                parent.y + 110
            );


            ctx.lineTo(
                targetX,
                members[0].y - 60
            );

            ctx.stroke();


        });


    }



    /*
        PAREJA -> HIJOS 👶
    */

    if (
        children.length &&
        members.length >= 2
    ) {


        const startX =
            unionX;


        const startY =
            unionY;



        const branchY =
            startY + 160;



        // línea desde el matrimonio

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY + 60
        );


        ctx.lineTo(
            startX,
            branchY
        );

        ctx.stroke();



        // barra superior de hijos

        if (children.length > 1) {


            ctx.beginPath();

            ctx.moveTo(
                children[0].x,
                branchY
            );


            ctx.lineTo(
                children[children.length - 1].x,
                branchY
            );

            ctx.stroke();


        }



        // bajadas hacia cada hijo

        for (const child of children) {


            ctx.beginPath();

            ctx.moveTo(
                child.x,
                branchY
            );


            ctx.lineTo(
                child.x,
                child.y - 60
            );


            ctx.stroke();


        }


    }



    /*
        SI SOLO HAY UNA PERSONA CON HIJOS
    */

    else if (
        children.length &&
        members.length === 1
    ) {


        const parent =
            members[0];


        const branchY =
            parent.y + 160;



        ctx.beginPath();

        ctx.moveTo(
            parent.x,
            parent.y + 60
        );


        ctx.lineTo(
            parent.x,
            branchY
        );

        ctx.stroke();



        if (children.length > 1) {


            ctx.beginPath();

            ctx.moveTo(
                children[0].x,
                branchY
            );


            ctx.lineTo(
                children[children.length - 1].x,
                branchY
            );

            ctx.stroke();

        }



        for (const child of children) {


            ctx.beginPath();

            ctx.moveTo(
                child.x,
                branchY
            );


            ctx.lineTo(
                child.x,
                child.y - 60
            );

            ctx.stroke();

        }

    }



    /*
        HERMANOS 👥
    */

    if (siblings.length && members.length) {


        const member =
            members[0];


        siblings.forEach(sibling => {


            ctx.beginPath();


            ctx.moveTo(
                sibling.x + 60,
                sibling.y
            );


            ctx.lineTo(
                member.x - 60,
                member.y
            );


            ctx.stroke();


        });


    }

}
