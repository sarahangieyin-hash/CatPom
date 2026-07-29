export async function drawNodes(
    ctx,
    layout
) {


    for (
        const node of layout.nodes
    ) {


        let username =
            node.id;



        try {

            const member =
                await layout.guild.members.fetch(node.id);


            username =
                member.user.username;


        } catch {}



        const size = 120;



        ctx.fillStyle =
            '#ffffff';



        ctx.fillRect(

            node.x - size / 2,

            node.y - size / 2,

            size,

            size

        );



        ctx.strokeStyle =
            '#000000';



        ctx.lineWidth =
            3;



        ctx.strokeRect(

            node.x - size / 2,

            node.y - size / 2,

            size,

            size

        );



        ctx.fillStyle =
            '#000000';



        ctx.font =
            'bold 18px "Noto Sans", "DejaVu Sans", Arial, sans-serif';



        ctx.textAlign =
            'center';



        ctx.textBaseline =
            'middle';



        const cleanName =
            username
                .replace(
                    /[^\p{L}\p{N}_-]/gu,
                    ''
                )
                .trim();



        ctx.fillText(

            cleanName || 'Usuario',

            node.x,

            node.y

        );


    }

}
