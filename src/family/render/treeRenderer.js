import {
    createCanvas
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

export async function renderFamilyTree(
    guild,
    family
) {

    const layout =
        await calculateLayout(
            guild,
            family
        );

    const scale = 2;

    const width =
        Math.max(
            1900,
            layout.width
        );

    const height =
        Math.max(
            1100,
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
        Fondo estilo MarriageBot
    */

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        '#202225'
    );

    gradient.addColorStop(
        1,
        '#111315'
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    /*
        Panel central
    */

    ctx.fillStyle =
        '#2b2d31';

    ctx.beginPath();

    ctx.roundRect(
        50,
        50,
        width - 100,
        height - 100,
        25
    );

    ctx.fill();

    /*
        Título
    */

    ctx.fillStyle =
        '#ffffff';

    ctx.font =
        'bold 46px Arial';

    ctx.textAlign =
        'center';

    ctx.fillText(
        'Árbol Familiar',
        width / 2,
        95
    );

    ctx.imageSmoothingEnabled = true;

    await drawLines(
        ctx,
        layout
    );

    await drawNodes(
        ctx,
        layout,
        guild
    );

    await drawIcons(
        ctx,
        layout
    );

    return canvas.toBuffer(
        'image/png'
    );

}
