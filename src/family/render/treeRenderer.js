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

    try {

        const layout =
            await calculateLayout(
                guild,
                family
            );

        const width =
            Math.max(
                1800,
                layout.width || 1800
            );

        const height =
            Math.max(
                1200,
                layout.height || 1200
            );

        const canvas =
            createCanvas(
                width,
                height
            );

        const ctx =
            canvas.getContext('2d');

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
            guild,
            layout
        );

        await drawIcons(
            ctx,
            layout
        );

        return canvas.toBuffer(
            'image/png'
        );

    } catch (err) {

        console.error(
            "TREE ERROR:",
            err
        );

        throw err;

    }

}
