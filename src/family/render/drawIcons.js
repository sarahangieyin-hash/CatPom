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





    /*
        AMANTES 🔥
    */


    members.forEach(

        member => {


            if (

                lovers.includes(
                    member.id
                )

            ) {


                ctx.font =
                    "28px Arial";


                ctx.textAlign =
                    "center";


                ctx.textBaseline =
                    "middle";



                ctx.fillText(

                    "🔥",

                    member.x + 45,

                    member.y - 45

                );


            }


        }

    );


}
