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
        MATRIMONIO 💍

        NO hay línea entre parejas.
        El anillo se dibuja aparte.
    */

    let unionX = null;
    let unionY = null;


    if (union) {

        unionX =
            union.x;

        unionY =
            union.y;

    }



    /*
        PADRES -> UNIÓN 💍
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
                unionY - 120
            );


            ctx.lineTo(
                unionX,
                unionY - 60
            );


            ctx.stroke();


        });


    }



    /*
        UNIÓN -> HIJOS 👶

        Los hijos salen del matrimonio,
        no de una sola persona.
    */


    if (
        children.length &&
        union
    ) {


        const branchY =
            unionY + 170;



        ctx.beginPath();


        ctx.moveTo(
            unionX,
            unionY + 60
        );


        ctx.lineTo(
            unionX,
            branchY
        );


        ctx.stroke();



        if (
            children.length > 1
        ) {


            ctx.beginPath();


            ctx.moveTo(
                children[0].x,
                branchY
            );


            ctx.lineTo(
                children[
                    children.length - 1
                ].x,
                branchY
            );


            ctx.stroke();


        }



        for (
            const child of children
        ) {


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


        const main =
            members[0];



        siblings.forEach(
            sibling => {


                ctx.beginPath();


                ctx.moveTo(
                    sibling.x + 60,
                    sibling.y
                );


                ctx.lineTo(
                    main.x - 60,
                    main.y
                );


                ctx.stroke();


            }
        );


    }


}
