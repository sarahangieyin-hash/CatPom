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


    const members =

        layout.nodes.filter(

            node =>
                node.type === 'member'

        );





    if (

        members.length < 2

    ) {

        return;

    }





    ctx.textAlign =
        'center';


    ctx.textBaseline =
        'middle';


    ctx.font =
        '32px DejaVuCustom';





    /*
        MATRIMONIOS 💍

        El anillo siempre aparece
        entre dos personas.

        Persona A 💍 Persona B

        Persona B 💍 Persona C

    */



    for (

        let i = 0;

        i < members.length - 1;

        i++

    ) {


        const left =
            members[i];


        const right =
            members[i + 1];



        const x =

            (
                left.x +
                right.x
            )
            /
            2;



        const y =

            (
                left.y +
                right.y
            )
            /
            2;



        ctx.fillText(

            '💍',

            x,

            y

        );


    }


}
