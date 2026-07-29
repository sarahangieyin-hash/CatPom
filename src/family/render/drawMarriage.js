import {
    registerFont
} from 'canvas';

import path from 'path';

import {
    fileURLToPath
} from 'url';



const __filename =
    fileURLToPath(import.meta.url);


const __dirname =
    path.dirname(__filename);



registerFont(

    path.join(
        __dirname,
        '../../assets/fonts/DejaVuSans.ttf'
    ),

    {
        family:
            'DejaVuCustom'
    }

);





export function drawMarriage(
    ctx,
    layout
) {


    const unions =

        layout.nodes.filter(

            node =>
                node.type === 'union'

        );



    if (
        !unions.length
    ) {

        return;

    }





    ctx.textAlign =
        'center';


    ctx.textBaseline =
        'middle';


    ctx.font =
        '30px DejaVuCustom';





    unions.forEach(

        union => {


            /*
                El anillo se dibuja
                EXACTAMENTE en el nodo unión.

                No usa miembros.
                No usa posiciones antiguas.
            */


            ctx.fillText(

                '💍',

                union.x,

                union.y

            );


        }

    );


}
