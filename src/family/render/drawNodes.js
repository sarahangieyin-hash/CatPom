export async function drawNodes(
    ctx,
    layout
) {


    for (
        const node of layout.nodes
    ) {


        const radius = 55;



        ctx.beginPath();


        ctx.arc(

            node.x,

            node.y,

            radius,

            0,

            Math.PI * 2

        );



        ctx.fillStyle =

            node.type === 'child'

                ? '#7ec8ff'

                : '#ffd166';



        ctx.fill();



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


        ctx.textBaseline =
            'middle';



        ctx.fillText(

            node.id,

            node.x,

            node.y

        );


    }

}
