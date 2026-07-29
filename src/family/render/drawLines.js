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
        MATRIMONIOS 💍

        Une cada pareja,
        pero no conecta hijos.

    */


    for (

        const union of unions

    ) {


        const index =
            unions.indexOf(union);



        const left =
            members[index];


        const right =
            members[index + 1];



        if (
            left &&
            right
        ) {


            ctx.beginPath();


            ctx.moveTo(

                left.x,

                left.y

            );


            ctx.lineTo(

                union.x,

                union.y

            );


            ctx.lineTo(

                right.x,

                right.y

            );


            ctx.stroke();


        }


    }





    /*
        PADRES 👨‍👩‍👧

        Van hacia la persona
        principal, no hacia
        una pareja aleatoria.

    */


    if (

        parents.length &&

        members.length

    ) {


        const main =
            members[0];



        parents.forEach(

            parent => {


                ctx.beginPath();


                ctx.moveTo(

                    parent.x,

                    parent.y + 60

                );


                ctx.lineTo(

                    main.x,

                    main.y - 60

                );


                ctx.stroke();


            }

        );


    }





    /*
        HIJOS 👶

        Salen de la unión si existe.

        Si no existe matrimonio,
        salen del miembro principal.

    */


    if (

        children.length

    ) {


        let origin =
            null;



        if (

            unions.length

        ) {


            origin =
                unions[0];


        } else if (

            members.length

        ) {


            origin =
                members[0];


        }





        if (origin) {



            const branchY =
                origin.y + 170;



            ctx.beginPath();


            ctx.moveTo(

                origin.x,

                origin.y + 40

            );


            ctx.lineTo(

                origin.x,

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

                    sibling.x,

                    sibling.y

                );


                ctx.lineTo(

                    main.x,

                    main.y

                );


                ctx.stroke();


            }

        );


    }


}
