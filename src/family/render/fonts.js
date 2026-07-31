import { registerFont } from 'canvas';
import path from 'path';

// Registrar físicamente la fuente desde src/assets/fonts/DejaVuSans.ttf
try {
    const fontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'DejaVuSans.ttf');
    registerFont(fontPath, { family: 'DejaVuSans' });
    console.log('✅ Fuente DejaVuSans registrada con éxito.');
} catch (e) {
    console.error('❌ Error al registrar la fuente DejaVuSans:', e);
}

export const fonts = {
    title: 'bold 40px "DejaVuSans"',
    name: 'bold 13px "DejaVuSans"',
    icon: '35px "DejaVuSans"'
};
