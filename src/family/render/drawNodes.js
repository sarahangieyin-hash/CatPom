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





    const totalPeople =

        (layout.members?.length || 0) +

        (layout.children?.length || 0) +

        (layout.parents?.length || 0) +

        (layout.siblings?.length || 0);





    /*
        TAMAÑO BASE

        La familia crece,
        pero las cajas no se hacen pequeñas.

    */


    const fontSize =

        Math.max(

            16,

            Math.min(

                22,

                22 - totalPeople

            )

        );





    for (
        const node of layout.nodes
    ) {



        if (

            node.type !== 'member' &&

            node.type !== 'child' &&

            node.type !== 'parent' &&

            node.type !== 'sibling'

        ) {

            continue;

        }





        if (

            typeof node.id !== 'string' ||

            !/^\d+$/.test(node.id)

        ) {

            continue;

        }





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
                    18
                );





        /*
            CAJA DINÁMICA

            El ancho depende del nombre.
            La altura siempre igual.

        */


        ctx.font =

            `bold ${fontSize}px DejaVuCustom`;



        const textWidth =

            ctx.measureText(
                safeName || '???'
            )
            .width;



        const boxWidth =

            Math.max(

                120,

                textWidth + 50

            );



        const boxHeight =

            120;





        /*
            CAJA
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
