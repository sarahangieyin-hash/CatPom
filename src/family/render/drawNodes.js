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



        switch(node.type) {


            case 'child':

                ctx.fillStyle =
                    '#7ec8ff';

                break;



            case 'parent':

                ctx.fillStyle =
                    '#ff9f9f';

                break;



            case 'sibling':

                ctx.fillStyle =
                    '#b8ff9f';

                break;



            case 'lover':

                ctx.fillStyle =
                    '#ff6b6b';

                break;



            default:

                ctx.fillStyle =
                    '#ffd166';

                break;


        }



        ctx.fill();



        ctx.strokeStyle =
            '#ffffff';


        ctx.lineWidth =
            4;


        ctx.stroke();



        ctx.fillStyle =
            '#ffffff';


        ctx.font =
            '18px Arial';


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
