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

        No usa emoji porque canvas no soporta emojis bien.
        Dibuja un anillo real.
    */

    if (members.length > 1) {

        const centerX =
            members.reduce(
                (sum, node) => sum + node.x,
                0
            ) / members.length;


        const centerY =
            members[0].y;



        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            22,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            6;


        ctx.stroke();


        // pequeño brillo

        ctx.beginPath();

        ctx.arc(
            centerX - 7,
            centerY - 7,
            4,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#fff2a8";


        ctx.fill();

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
                    "30px Arial";


                ctx.fillText(
                    "🔥",
                    member.x + 50,
                    member.y - 50
                );

            }

        }
    );

}
