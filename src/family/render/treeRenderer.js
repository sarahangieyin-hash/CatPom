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
        MEDIR TODO EL CONTENIDO

        IMPORTANTE:
        Incluye unions 💍
        para que no se desplacen.
    */


    const nodes =
        layout.nodes;



    const nodeSize =
        120;


    const padding =
        120;





    const minX =

        Math.min(

            ...nodes.map(
                node =>
                    node.x
            )

        );



    const maxX =

        Math.max(

            ...nodes.map(
                node =>
                    node.x
            )

        );



    const minY =

        Math.min(

            ...nodes.map(
                node =>
                    node.y
            )

        );



    const maxY =

        Math.max(

            ...nodes.map(
                node =>
                    node.y
            )

        );





    const contentWidth =

        maxX -
        minX;



    const contentHeight =

        maxY -
        minY;





    const width =

        Math.max(

            900,

            contentWidth +
            nodeSize +
            padding * 2

        );



    const height =

        Math.max(

            700,

            contentHeight +
            nodeSize +
            padding * 2

        );





    /*
        CENTRADO REAL

        Mantiene personas y anillos
        en el mismo sitio.
    */


    const offsetX =

        (
            width -
            contentWidth

        )
        /
        2
        -
        minX;



    const offsetY =

        (
            height -
            contentHeight

        )
        /
        2
        -
        minY;





    layout.nodes.forEach(

        node => {


            node.x += offsetX;


            node.y += offsetY;


        }

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
        FONDO
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





    /*
        ORDEN:

        1. Líneas detrás
        2. Personas
        3. Iconos/anillos encima
    */


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
