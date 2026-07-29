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

        Dibujado con Canvas para evitar
        emojis rotos y cuadrados.
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
            Aro exterior dorado
        */


        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            7;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            22,

            0,

            Math.PI * 2

        );


        ctx.stroke();



        /*
            Interior del aro
        */


        ctx.strokeStyle =
            "#fff4a3";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            13,

            0,

            Math.PI * 2

        );


        ctx.stroke();



        /*
            Piedra del anillo
        */


        ctx.fillStyle =
            "#e8ffff";


        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(

            centerX,

            centerY - 38

        );


        ctx.lineTo(

            centerX + 12,

            centerY - 22

        );


        ctx.lineTo(

            centerX,

            centerY - 8

        );


        ctx.lineTo(

            centerX - 12,

            centerY - 22

        );


        ctx.closePath();


        ctx.fill();


        ctx.stroke();


    }





    /*
        🔥 AMANTES

        Sin emojis para evitar cuadrados.
    */


    members.forEach(

        member => {


            if (

                lovers.includes(
                    member.id
                )

            ) {


                ctx.fillStyle =
                    "#ff3030";


                ctx.font =
                    "32px Arial";


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
