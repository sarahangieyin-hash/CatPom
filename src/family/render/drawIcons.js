export async function drawIcons(
    ctx,
    layout
) {

    const members =
        layout.nodes.filter(
            node => node.type === 'member'
        );


    const lovers =
        layout.lovers || [];


    /*
        💍 ANILLO DE CASADOS
        Usamos texto simple para evitar
        el cuadrado roto de emojis de Canvas.
    */

    if (members.length > 1) {

        const centerX =
            members.reduce(
                (sum, node) =>
                    sum + node.x,
                0
            ) / members.length;


        const centerY =
            members[0].y;


        ctx.font =
            '40px Arial';


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';


        ctx.fillText(
            '○',
            centerX,
            centerY
        );

    }



    /*
        🔥 AMANTES
    */

    members.forEach(
        member => {

            if (
                lovers.includes(member.id)
            ) {

                ctx.font =
                    '30px Arial';


                ctx.fillText(
                    '🔥',
                    member.x + 45,
                    member.y - 45
                );

            }

        }
    );

}
