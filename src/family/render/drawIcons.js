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
        💍 ANILLO DE MATRIMONIO
    */


    if (members.length > 1) {


        const centerX =
            members.reduce(
                (sum,node)=>
                    sum + node.x,
                0
            )
            /
            members.length;



        const centerY =
            members[0].y - 90;




        /*
            ARO
        */


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            18,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            5;


        ctx.stroke();




        /*
            PIEDRA DEL ANILLO
        */


        ctx.beginPath();


        ctx.moveTo(
            centerX - 8,
            centerY - 16
        );


        ctx.lineTo(
            centerX,
            centerY - 28
        );


        ctx.lineTo(
            centerX + 8,
            centerY - 16
        );


        ctx.closePath();



        ctx.fillStyle =
            "#fff2a8";


        ctx.fill();



        ctx.strokeStyle =
            "#d4af37";


        ctx.lineWidth =
            2;


        ctx.stroke();

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


                ctx.font =
                    "28px Arial";


                ctx.fillText(
                    "🔥",
                    member.x + 50,
                    member.y - 50
                );

            }


        }

    );


}
