export async function drawLines(
    ctx,
    layout
) {


    const members =
        layout.nodes.filter(
            node =>
                node.type === 'member'
        );


    const children =
        layout.nodes.filter(
            node =>
                node.type === 'child'
        );


    const parents =
        layout.nodes.filter(
            node =>
                node.type === 'parent'
        );


    const siblings =
        layout.nodes.filter(
            node =>
                node.type === 'sibling'
        );


    const unions =
        layout.nodes.filter(
            node =>
                node.type === 'union'
        );



    ctx.strokeStyle =
        "#000000";


    ctx.lineWidth =
        4;


    ctx.lineCap =
        "round";





    /*
        PADRES -> UNIÓN 💍

        Se conectan al primer matrimonio.
    */


    const mainUnion =
        unions[0];



    if (
        parents.length &&
        mainUnion
    ) {


        parents.forEach(

            parent => {


                ctx.beginPath();


                ctx.moveTo(

                    parent.x,

                    parent.y + 60

                );


                ctx.lineTo(

                    parent.x,

                    mainUnion.y - 120

                );


                ctx.lineTo(

                    mainUnion.x,

                    mainUnion.y - 60

                );


                ctx.stroke();


            }

        );


    }





    /*
        UNIÓN -> HIJOS 👶

        Los hijos salen del centro
        del matrimonio.
    */


    if (
        children.length &&
        mainUnion
    ) {


        const branchY =
            mainUnion.y + 170;



        ctx.beginPath();


        ctx.moveTo(

            mainUnion.x,

            mainUnion.y + 40

        );


        ctx.lineTo(

            mainUnion.x,

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





        children.forEach(

            child => {


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

        );


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





    /*
        POLIAMOR 💍

        Une visualmente los matrimonios.
        Ejemplo:

        A 💍 B 💍 C

    */


    if (
        unions.length > 1
    ) {


        for (
            let i = 0;
            i < unions.length - 1;
            i++
        ) {


            ctx.beginPath();


            ctx.moveTo(

                unions[i].x,

                unions[i].y

            );


            ctx.lineTo(

                unions[i + 1].x,

                unions[i + 1].y

            );


            ctx.stroke();


        }


    }


}
