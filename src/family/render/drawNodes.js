import { registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    registerFont(
        path.join(__dirname, '../../assets/fonts/DejaVuSans.ttf'),
        { family: 'DejaVuCustom' }
    );
} catch (e) {}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

export async function drawNodes(ctx, layout) {
    const drawn = new Set();
    const targetUserId = layout.targetUserId || layout.userId;
    const settings = layout.settings || {};

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (const node of layout.nodes) {
        if (!['member', 'child', 'parent', 'sibling'].includes(node.type)) {
            continue;
        }

        if (typeof node.id !== 'string' || !/^\d+$/.test(node.id)) {
            continue;
        }

        if (drawn.has(node.id)) continue;
        drawn.add(node.id);

        let username = String(node.id);
        try {
            const member = await layout.guild.members.fetch(node.id);
            username = member.displayName || member.user.username;
        } catch {}

        const safeName = username
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_\- ]/g, '')
            .slice(0, 20);

        ctx.font = '600 16px "Segoe UI", "Inter", "Helvetica Neue", "DejaVuCustom", sans-serif';

        const textWidth = ctx.measureText(safeName || 'User').width;
        const boxWidth = Math.max(140, textWidth + 36);
        const boxHeight = 46;
        const cornerRadius = 10;

        const isMainUser = node.id === targetUserId;

        const left = node.x - boxWidth / 2;
        const top = node.y - boxHeight / 2;

        // Colors desde la personalización
        const bgColor = isMainUser ? (settings.userBg || '#1d4ed8') : (settings.nodeBg || '#111111');
        const textColor = isMainUser ? (settings.userText || '#ffffff') : (settings.nodeText || '#ffffff');

        // 1. Fondo de caja
        ctx.fillStyle = bgColor;
        drawRoundedRect(ctx, left, top, boxWidth, boxHeight, cornerRadius);
        ctx.fill();

        // 2. Borde fino
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, left, top, boxWidth, boxHeight, cornerRadius);
        ctx.stroke();

        // 3. Texto
        ctx.fillStyle = textColor;
        ctx.fillText(safeName || 'User', node.x, node.y + 1);
    }
}
