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

        Solo dibuja la unión entre personas.
        NO crea líneas extra.
    */


    unions.forEach(

        (union,index)=>{


            const left =
                members[index];


            const right =
                members[index + 1];



            if (
                !left ||
                !right
            ) {

                return;

            }



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

    );







    /*
        PADRES 👨‍👩‍👧

        Se conectan al primer miembro.
    */


    if (

        parents.length &&

        members.length

    ) {


        const main =
            members[0];



        parents.forEach(

            parent=>{


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

        Hijos individuales:
        salen del padre que los adoptó.

        Hijos compartidos:
        salen del matrimonio.
    */


    children.forEach(

        child=>{


            let origin = null;




            if (
                child.parent
            ) {


                origin =
                    members.find(

                        member =>

                            member.id === child.parent

                    );


            }




            if (
                !origin &&
                unions.length
            ) {


                origin =
                    unions[0];


            }




            if (
                !origin &&
                members.length
            ) {


                origin =
                    members[0];


            }





            if (!origin)
                return;





            ctx.beginPath();



            ctx.moveTo(

                origin.x,

                origin.y + 40

            );



            ctx.lineTo(

                child.x,

                child.y - 60

            );



            ctx.stroke();



        }

    );







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

            sibling=>{


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
