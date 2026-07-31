import { registerFont } from 'canvas';
import path from 'path';

// Registramos el archivo TTF que descargaste
try {
    // Si DejaVuSans.ttf está en la misma carpeta que fonts.js:
    registerFont(path.resolve('./DejaVuSans.ttf'), { family: 'DejaVuSans' });
    
    // NOTA: Si está dentro de una carpeta como "assets" o "fonts", usa su ruta correspondiente, por ejemplo:
    // registerFont(path.resolve('./src/assets/DejaVuSans.ttf'), { family: 'DejaVuSans' });
} catch (e) {
    console.error('Error registrando DejaVuSans.ttf:', e);
}

export const fonts = {
    title: 'bold 40px "DejaVuSans"',
    name: 'bold 13px "DejaVuSans"',
    icon: '35px "DejaVuSans"'
};
