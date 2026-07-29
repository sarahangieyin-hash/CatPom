import { loadImage } from 'canvas';


export async function drawNodes(
    ctx,
    layout
) {


    for (
        const node of layout.nodes
    ) {


        let user = null;


        try {

            const member =
                await layout.guild.members.fetch(node.id);

            user =
                member.user;

        } catch {}



        const radius = 55;



        /*
            NOMBRE ENCIMA
        */


        if (user) {

            ctx.fillStyle = '#000000';

            ctx.font =
                'bold 18px Arial';

            ctx.textAlign =
                'center';

            ctx.textBaseline =
                'alphabetic';


            ctx.fillText(

                user.username,

                node.x,

                node.y - radius - 15

            );

        }



        /*
            CIRCULO FOTO
        */


        ctx.beginPath();

        ctx.arc(

            node.x,

            node.y,

            radius,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            '#ffffff';


        ctx.fill();


        ctx.strokeStyle =
            '#000000';


        ctx.lineWidth =
            3;


        ctx.stroke();



        if (user) {


            try {


                const avatar =
                    await loadImage(

                        user.displayAvatarURL({

                            extension:
                                'png',

                            size:
                                128

                        })

                    );



                ctx.save();



                ctx.beginPath();



                ctx.arc(

                    node.x,

                    node.y,

                    radius - 3,

                    0,

                    Math.PI * 2

                );



                ctx.clip();



                ctx.drawImage(

                    avatar,

                    node.x - radius + 3,

                    node.y - radius + 3,

                    (radius - 3) * 2,

                    (radius - 3) * 2

                );



                ctx.restore();



            } catch {}

        }


    }

}
