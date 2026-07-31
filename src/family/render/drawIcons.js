import { loadImage } from 'canvas';

export async function drawIcons(ctx, layout) {
    const { nodes } = layout;
    const avatarSize = 40;

    for (const node of nodes) {
        if (!node.avatar || node.type === 'union' || node.hidden) continue;

        try {
            const img = await loadImage(node.avatar);
            const x = node.x - avatarSize / 2;
            const y = node.y - avatarSize / 2 - 10;

            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, x, y, avatarSize, avatarSize);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        } catch (error) {
            // Se omiten avatares que fallen en la carga
        }
    }
}
