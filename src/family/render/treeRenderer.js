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

    layout.guild = guild;

    const scale = 2;

    const width =
        Math.max(
            1600,
            layout.width
        );

    const height =
        Math.max(
            1000,
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

    ctx.fillStyle = '#111111';

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    ctx.imageSmoothingEnabled = true;

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
