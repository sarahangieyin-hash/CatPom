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
        AJUSTE REAL AL CONTENIDO

        El canvas se adapta a donde están
        realmente las personas.
    */


    const nodes =

        layout.nodes.filter(

            node =>
                node.type !== 'union'

        );



    const nodeSize =
        120;


    const padding =
        120;



    const minX =

        Math.min(

            ...nodes.map(
                n => n.x
            )

        );



    const maxX =

        Math.max(

            ...nodes.map(
                n => n.x
            )

        );



    const minY =

        Math.min(

            ...nodes.map(
                n => n.y
            )

        );



    const maxY =

        Math.max(

            ...nodes.map(
                n => n.y
            )

        );





    const width =

        (
            maxX -
            minX
        )
        +
        nodeSize
        +
        padding * 2;



    const height =

        (
            maxY -
            minY
        )
        +
        nodeSize
        +
        padding * 2;





    /*
        MOVER TODO AL CENTRO
    */


    const offsetX =
        padding - minX;


    const offsetY =
        padding - minY;



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
        FONDO ADAPTADO
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
