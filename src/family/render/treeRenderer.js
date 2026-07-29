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
        TAMAÑO DINÁMICO

        Cuantos más miembros,
        más grande será el lienzo.

    */


    const memberCount =
        (layout.members?.length || 0) +
        (layout.children?.length || 0) +
        (layout.parents?.length || 0) +
        (layout.siblings?.length || 0);



    const width =
        Math.max(

            1600,

            layout.width,

            1200 + memberCount * 180

        );



    const height =
        Math.max(

            1000,

            layout.height,

            900 + memberCount * 80

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
        FONDO DINÁMICO

        La imagen ocupa todo el árbol.
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
