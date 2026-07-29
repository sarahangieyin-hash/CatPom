import {
    registerFont
} from 'canvas';

import path from 'path';

import {
    fileURLToFileURL,
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



export async function drawNodes(
    ctx,
    layout
) {


    for (
        const node of layout.nodes
    ) {


        /*
            IGNORAR NODOS INTERNOS
        */

        if (

            node.type !== 'member' &&
            node.type !== 'child' &&
            node.type !== 'parent' &&
            node.type !== 'sibling'

        ) {

            continue;

        }



        /*
            IGNORAR IDS QUE NO SEAN DISCORD IDS
        */

        if (

            typeof node.id !== 'string' ||

            !/^\d+$/.test(node.id)

        ) {

            continue;

        }




        let username =
            String(node.id);



        try {


            const member =
                await layout.guild.members.fetch(
                    node.id
                );


            username =
                member.user.username;


        } catch {}





        const size =
            120;



        /*
            CAJA
        */


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





        /*
            NOMBRE
        */


        ctx.fillStyle =
            '#000000';


        ctx.font =
            'bold 18px DejaVuCustom';


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';




        const safeName =

            username

                .normalize('NFD')

                .replace(
                    /[\u0300-\u036f]/g,
                    ''
                )

                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    ''
                )

                .slice(
                    0,
                    12
                );




        ctx.fillText(

            safeName || '???',

            node.x,

            node.y

        );


    }

}
