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


    const union =
        layout.nodes.find(
            node => node.type === 'union'
        );



    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";



    /*
        PERSONAS CASADAS -> ANILLO 💍
    */

    if (
        union &&
        members.length >= 2
    ) {


        for (const member of members) {


            ctx.beginPath();

            ctx.moveTo(
                member.x,
                member.y + 60
            );


            ctx.lineTo(
                union.x,
                union.y
            );


            ctx.stroke();

        }

    }



    /*
        PADRES -> ANILLO/PAREJA
    */

    if (
        parents.length &&
        union
    ) {


        parents.forEach(parent => {


            ctx.beginPath();

            ctx.moveTo(
                parent.x,
                parent.y + 60
            );


            ctx.lineTo(
                parent.x,
                parent.y + 120
            );


            ctx.lineTo(
                union.x,
                union.y
            );


            ctx.stroke();


        });


    }



    /*
        ANILLO -> HIJOS 👶
        Los hijos siempre nacen de la pareja
    */

    if (
        children.length &&
        union
    ) {


        const branchY =
            union.y + 200;



        ctx.beginPath();

        ctx.moveTo(
            union.x,
            union.y
        );


        ctx.lineTo(
            union.x,
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
        CASO: MADRE/PADRE SOLTERO CON HIJOS
    */

    if (
        children.length &&
        !union &&
        members.length === 1
    ) {


        const parent =
            members[0];


        const branchY =
            parent.y + 180;



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

    if (
        siblings.length &&
        members.length
    ) {


        siblings.forEach(sibling => {


            ctx.beginPath();

            ctx.moveTo(
                sibling.x + 60,
                sibling.y
            );


            ctx.lineTo(
                members[0].x - 60,
                members[0].y
            );


            ctx.stroke();


        });


    }


}
