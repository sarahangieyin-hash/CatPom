export async function drawIcons(
    ctx,
    layout
) {


    const members =
        layout.nodes.filter(

            node =>
                node.type === 'member'

        );



    const lovers =
        layout.lovers || [];



    ctx.font =
        '35px Arial';



    ctx.textAlign =
        'center';


    ctx.textBaseline =
        'middle';



    /*
        💍 ICONO DE UNIÓN
    */


    if (
        members.length > 1
    ) {


        const centerX =

            members.reduce(

                (sum,node) =>
                    sum + node.x,

                0

            )
            /
            members.length;



        ctx.fillText(

            '💍',

            centerX,

            members[0].y - 90

        );

    }



    /*
        🔥 AMANTES
    */


    members.forEach(

        member => {


            if (
                lovers.includes(
                    member.id
                )
            ) {


                ctx.fillText(

                    '🔥',

                    member.x + 45,

                    member.y - 45

                );


            }


        }

    );


}
