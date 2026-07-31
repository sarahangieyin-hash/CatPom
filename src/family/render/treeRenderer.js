import { createCanvas, Image } from 'canvas';
import { calculateLayout } from './layout.js';
import { drawNodes } from './drawNodes.js';
import { drawLines } from './drawLines.js';
import { drawIcons } from './drawIcons.js';
import { drawMarriage } from './drawMarriage.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backgroundPath = path.join(
    __dirname,
    '../../assets/backgrounds/tree-bg.png'
);

export async function renderFamilyTree(guild, family) {
    const layout = await calculateLayout(guild, family);
    layout.guild = guild;

    const scale = 2;
    const nodes = layout.nodes;

    if (!nodes || nodes.length === 0) {
        throw new Error('No hay nodos para renderizar en el árbol.');
    }

    const nodeSize = 120;
    const padding = 140;

    // Calcular límites exactos del canvas
    const minX = Math.min(...nodes.map(node => node.x));
    const maxX = Math.max(...nodes.map(node => node.x));
    const minY = Math.min(...nodes.map(node => node.y));
    const maxY = Math.max(...nodes.map(node => node.y));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const width = Math.max(900, contentWidth + nodeSize + padding * 2);
    const height = Math.max(700, contentHeight + nodeSize + padding * 2);

    // Calcular desplazamiento ÚNICO para centrar todo el árbol en la imagen
    const offsetX = width / 2 - (minX + maxX) / 2;
    const offsetY = height / 2 - (minY + maxY) / 2;

    layout.nodes.forEach(node => {
        node.x += offsetX;
        node.y += offsetY;
    });

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);

    // Dibujar fondo si existe o blanco si no
    if (fs.existsSync(backgroundPath)) {
        try {
            const bg = new Image();
            bg.src = backgroundPath;
            ctx.drawImage(bg, 0, 0, width, height);
        } catch {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }

    /*
        ORDEN DE CAPAS:
        1. Líneas familiares (al fondo)
        2. Tarjetas de usuarios / Nodos
        3. Anillo de matrimonio (por encima de la unión sin líneas atravesadas)
        4. Otros iconos
    */
    await drawLines(ctx, layout);
    await drawNodes(ctx, layout);
    await drawMarriage(ctx, layout);
    if (typeof drawIcons === 'function') {
        await drawIcons(ctx, layout);
    }

    return canvas.toBuffer('image/png');
}
