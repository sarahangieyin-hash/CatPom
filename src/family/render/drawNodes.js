import { registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Registrar fuente estándar si existe
try {
    registerFont(
        path.join(__dirname, '../../assets/fonts/DejaVuSans.ttf'),
        { family: 'DejaVuCustom' }
    );
} catch (e) {
    // Si no existe, usará la fuente por defecto del sistema (Sans-serif)
}

export async function drawNodes(ctx, layout) {
    const drawn = new Set();
    const targetUserId = layout.targetUserId || layout.userId;

    for (const node of layout.nodes) {
        if (!['member', 'child', 'parent', 'sibling'].includes(node.type)) {
            continue;
        }

        if (typeof node.id !== 'string' || !/^\d+$/.test(node.id)) {
            continue;
        }

        if (drawn.has(node.id)) continue;
        drawn.add(node.id);

        // Obtener el nombre del usuario
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

        // Ajuste de texto y caja estilo Graphviz / MarriageBot
        ctx.font = '18px "DejaVuCustom", "Helvetica", "Arial", sans-serif';
        const textWidth = ctx.measureText(safeName || 'User').width;

        const boxWidth = Math.max(140, textWidth + 40);
        const boxHeight = 50; // Cajas más estilizadas y rectangulares

        const isMainUser = node.id === targetUserId;

        // 🎨 ESTILO MARRIAGEBOT:
        // Fondo blanco/crema claro
        ctx.fillStyle = isMainUser ? '#eef2ff' : '#ffffff';

        // Dibujar el rectángulo
        ctx.fillRect(
            node.x - boxWidth / 2,
            node.y - boxHeight / 2,
            boxWidth,
            boxHeight
        );

        // Borde
        ctx.strokeStyle = isMainUser ? '#4f46e5' : '#333333'; // Borde morado si eres tú, gris si no
        ctx.lineWidth = isMainUser ? 3 : 1.5;

        ctx.strokeRect(
            node.x - boxWidth / 2,
            node.y - boxHeight / 2,
            boxWidth,
            boxHeight
        );

        // Nombre del usuario
        ctx.fillStyle = isMainUser ? '#312e81' : '#111827';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(safeName || 'User', node.x, node.y);
    }
}
