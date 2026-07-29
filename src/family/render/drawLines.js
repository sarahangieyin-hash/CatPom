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



    ctx.strokeStyle =
        '#ffffff';


    ctx.lineWidth =
        3;



    // Línea de unión 💍

    if (
        members.length > 1
    ) {

        const first =
            members[0];


        const last =
            members[members.length - 1];



        ctx.beginPath();


        ctx.moveTo(
            first.x,
            first.y
        );


        ctx.lineTo(
            last.x,
            last.y
        );


        ctx.stroke();


    }



    // Línea hacia hijos 👶

    if (
        children.length > 0 &&
        members.length > 0
    ) {


        const centerX =

            members.reduce(

                (sum, node) =>
                    sum + node.x,

                0

            )
            /
            members.length;



        ctx.beginPath();


        ctx.moveTo(

            centerX,

            members[0].y

        );


        ctx.lineTo(

            centerX,

            children[0].y - 80

        );


        ctx.stroke();



        children.forEach(

            child => {


                ctx.beginPath();


                ctx.moveTo(

                    centerX,

                    children[0].y - 80

                );


                ctx.lineTo(

                    child.x,

                    child.y

                );


                ctx.stroke();


            }

        );

    }

}
