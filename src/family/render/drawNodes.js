import {
    loadAvatar
} from './avatar.js';



export async function drawNodes(
    ctx,
    layout
) {


    for (
        const node of layout.nodes
    ) {


        const radius = 55;


        let image = null;


        const member =
            await layout.guild.members.fetch(
                node.id
            )
            .catch(
                () => null
            );


        if (member) {

            const avatar =
                await loadAvatar(
                    member.user
                );


            if (avatar) {

                const img =
                    await import(
                        'canvas'
                    )
                    .then(
                        module =>
                            module.loadImage(
                                avatar
                            )
                    );


                image = img;

            }

        }



        ctx.save();



        ctx.beginPath();


        ctx.arc(

            node.x,

            node.y,

            radius,

            0,

            Math.PI * 2

        );


        ctx.clip();



        if (image) {


            ctx.drawImage(

                image,

                node.x - radius,

                node.y - radius,

                radius * 2,

                radius * 2

            );


        } else {


            ctx.fillStyle =
                node.type === 'child'
                    ? '#7ec8ff'
                    : '#ffd166';


            ctx.fill();


        }



        ctx.restore();



        ctx.beginPath();


        ctx.arc(

            node.x,

            node.y,

            radius,

            0,

            Math.PI * 2

        );


        ctx.strokeStyle =
            '#ffffff';


        ctx.lineWidth =
            4;


        ctx.stroke();



        ctx.fillStyle =
            '#ffffff';


        ctx.font =
            '20px Arial';


        ctx.textAlign =
            'center';


        ctx.fillText(

            node.id,

            node.x,

            node.y + 85

        );


    }

}
