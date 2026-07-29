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





export async function drawNodes(
    ctx,
    layout
) {


    const drawn =
        new Set();





    for (
        const node of layout.nodes
    ) {


        /*
            SOLO PERSONAS
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
            IDS VALIDOS
        */


        if (

            typeof node.id !== 'string' ||

            !/^\d+$/.test(node.id)

        ) {

            continue;

        }





        /*
            EVITAR DUPLICADOS
        */


        if (

            drawn.has(node.id)

        ) {

            continue;

        }


        drawn.add(
            node.id
        );





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
                    25
                );





        /*
            TEXTO
        */


        const fontSize =
            20;



        ctx.font =

            `bold ${fontSize}px DejaVuCustom`;





        const textWidth =

            ctx.measureText(

                safeName || '???'

            )
            .width;





        /*
            CAJA ADAPTABLE

            Nombre corto:
            120px

            Nombre largo:
            crece horizontalmente

        */


        const boxWidth =

            Math.max(

                120,

                textWidth + 50

            );



        const boxHeight =

            120;





        /*
            CUADRADO
        */


        ctx.fillStyle =
            '#ffffff';



        ctx.fillRect(

            node.x - boxWidth / 2,

            node.y - boxHeight / 2,

            boxWidth,

            boxHeight

        );





        ctx.strokeStyle =
            '#000000';



        ctx.lineWidth =
            3;



        ctx.strokeRect(

            node.x - boxWidth / 2,

            node.y - boxHeight / 2,

            boxWidth,

            boxHeight

        );





        /*
            NOMBRE
        */


        ctx.fillStyle =
            '#000000';



        ctx.textAlign =
            'center';



        ctx.textBaseline =
            'middle';



        ctx.fillText(

            safeName || '???',

            node.x,

            node.y

        );


    }


}
