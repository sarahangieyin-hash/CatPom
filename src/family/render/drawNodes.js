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
        TAMAÑO DINÁMICO

        Poca familia:
        cuadros grandes.

        Mucha familia:
        cuadros más pequeños.
    */


    const size =

        Math.max(

            85,

            Math.min(

                160,

                160 -
                (
                    totalPeople * 7
                )

            )

        );



    const fontSize =

        Math.max(

            12,

            Math.min(

                24,

                size / 7

            )

        );





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
            IGNORAR IDS INVALIDOS
        */


        if (

            typeof node.id !== 'string' ||

            !/^\d+$/.test(node.id)

        ) {

            continue;

        }





        /*
            EVITAR DUPLICADOS

            Una persona no puede salir
            dos veces si es hijo y miembro.
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

            `bold ${fontSize}px DejaVuCustom`;



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
