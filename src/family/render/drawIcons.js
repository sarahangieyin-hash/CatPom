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
        💍 ANILLO DE CASADOS

        Se dibuja en medio de las parejas.
        No usa emojis para evitar cuadrados.
    */


    if (
        members.length > 1
    ) {


        const centerX =

            members.reduce(

                (sum, node) =>
                    sum + node.x,

                0

            )
            /
            members.length;



        const centerY =
            members[0].y;



        /*
            Aro del anillo
        */


        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            5;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            18,

            0,

            Math.PI * 2

        );


        ctx.stroke();



        /*
            Diamante del anillo
        */


        ctx.fillStyle =
            "#d4af37";


        ctx.beginPath();


        ctx.arc(

            centerX + 12,

            centerY - 14,

            6,

            0,

            Math.PI * 2

        );


        ctx.fill();


    }





    /*
        🔥 AMANTES

        También sin emoji para evitar cuadrados.
    */


    members.forEach(

        member => {


            if (

                lovers.includes(
                    member.id
                )

            ) {


                ctx.fillStyle =
                    "#ff4500";


                ctx.font =
                    "35px Arial";


                ctx.textAlign =
                    "center";


                ctx.textBaseline =
                    "middle";


                ctx.fillText(

                    "♥",

                    member.x + 50,

                    member.y - 50

                );


            }


        }

    );


}
