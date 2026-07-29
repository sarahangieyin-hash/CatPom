export async function drawIcons(
    ctx,
    layout
) {


    const members =
        layout.nodes.filter(

            node =>
                node.type === 'member'

        );


    const union =
        layout.nodes.find(

            node =>
                node.type === 'union'

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
        💍 ICONO DE MATRIMONIO

        Usa el nodo invisible union_main
        que está colocado en medio.
    */


    if (
        union &&
        members.length > 1
    ) {


        ctx.fillText(

            '💍',

            union.x,

            union.y

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
