import { createCanvas } from 'canvas';
import { calculateLayout } from './layout.js';
import { drawNodes } from './drawNodes.js';
import { drawLines } from './drawLines.js';
import { drawIcons } from './drawIcons.js';
import { drawMarriage } from './drawMarriage.js';
import { getTreeSettings } from '../../utils/families.js';

export async function renderFamilyTree(guild, family) {
    const settings = await getTreeSettings(family.userId || family.targetUser);
    
    const layout = await calculateLayout(guild, family);
    layout.guild = guild;
    layout.settings = settings;

    const scale = 2;
    const nodes = layout.nodes;

    if (!nodes || nodes.length === 0) {
        throw new Error('No hay nodos para renderizar en el árbol.');
    }

    const nodeSize = 100;
    const padding = 60;

    const minX = Math.min(...nodes.map(node => node.x));
    const maxX = Math.max(...nodes.map(node => node.x));
    const minY = Math.min(...nodes.map(node => node.y));
    const maxY = Math.max(...nodes.map(node => node.y));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const width = Math.max(600, contentWidth + nodeSize + padding * 2);
    const height = Math.max(450, contentHeight + nodeSize + padding * 2);

    const offsetX = width / 2 - (minX + maxX) / 2;
    const offsetY = height / 2 - (minY + maxY) / 2;

    layout.nodes.forEach(node => {
        node.x += offsetX;
        node.y += offsetY;
    });

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);

    ctx.fillStyle = settings.background || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    await drawLines(ctx, layout);
    await drawNodes(ctx, layout);
    await drawMarriage(ctx, layout);
    if (typeof drawIcons === 'function') {
        await drawIcons(ctx, layout);
    }

    return canvas.toBuffer('image/png');
}
