import { loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Busca el anillo png en tus carpetas de assets
const ringPaths = [
    path.join(__dirname, '../../assets/icons/ring.png'),
    path.join(__dirname, '../../assets/ring.png'),
    path.join(__dirname, '../../../assets/ring.png')
];

let ringImagePath = ringPaths.find(p => fs.existsSync(p)) || null;

export async function drawMarriage(ctx, layout) {
    const members = layout.nodes.filter(node => node.type === 'member');

    if (members.length < 2) return;

    let ringImg = null;
    if (ringImagePath) {
        try {
            ringImg = await loadImage(ringImagePath);
        } catch (e) {
            ringImg = null;
        }
    }

    for (let i = 0; i < members.length - 1; i++) {
        const left = members[i];
        const right = members[i + 1];

        const x = (left.x + right.x) / 2;
        const y = (left.y + right.y) / 2;

        const iconSize = 48;

        if (ringImg) {
            // Dibuja la imagen PNG del anillo exactamente en el medio
            ctx.drawImage(
                ringImg,
                x - iconSize / 2,
                y - iconSize / 2,
                iconSize,
                iconSize
            );
        } else {
            // Respaldo de seguridad en texto
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '36px DejaVuCustom, Arial';
            ctx.fillText('💍', x, y);
        }
    }
}
