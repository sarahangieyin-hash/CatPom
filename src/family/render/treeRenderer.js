import {
    createCanvas,
    Image
} from 'canvas';

import {
    calculateLayout
} from './layout.js';

import {
    drawNodes
} from './drawNodes.js';

import {
    drawLines
} from './drawLines.js';

import {
    drawIcons
} from './drawIcons.js';

import path from 'path';

import {
    fileURLToPath
} from 'url';



const __filename =
    fileURLToPath(import.meta.url);


const __dirname =
    path.dirname(__filename);



const backgroundPath =
    path.join(
        __dirname,
        '../../assets/backgrounds/tree-bg.png'
    );



export async function renderFamilyTree(
    guild,
    family
) {


    console.log(
        "TREE FAMILY:",
        JSON.stringify(
            family,
            null,
            2
        )
    );



    const layout =
        await calculateLayout(
            guild,
            family
        );


    layout.guild =
        guild;



    const scale =
        2;



    /*
        EL TAMAÑO VIENE DEL LAYOUT

        No añade espacio extra.
        El layout decide el tamaño.
    */


    const width =

        Math.ceil(
            layout.width
        );



    const height =

        Math.ceil(
            layout.height
        );





    const canvas =
        createCanvas(

            width * scale,

            height * scale

        );



    const ctx =
        canvas.getContext('2d');



    ctx.scale(
        scale,
        scale
    );





    /*
        FONDO ADAPTADO AL LIENZO
    */


    try {


        const bg =
            new Image();



        bg.src =
            backgroundPath;



        ctx.drawImage(

            bg,

            0,

            0,

            width,

            height

        );


    } catch(error) {


        console.log(
            "No se pudo cargar fondo:",
            error.message
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(

            0,

            0,

            width,

            height

        );


    }





    ctx.imageSmoothingEnabled =
        true;





    await drawLines(

        ctx,

        layout

    );



    await drawNodes(

        ctx,

        layout

    );



    await drawIcons(

        ctx,

        layout

    );





    return canvas.toBuffer(
        'image/png'
    );

}
