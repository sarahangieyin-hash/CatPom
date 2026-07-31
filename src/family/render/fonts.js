import { registerFont } from 'canvas';
import path from 'path';

// Intentar registrar una fuente física si la tienes en alguna carpeta local,
// o configurar una familia estándar de reserva.
export const fontFamily = 'sans-serif';

export const fonts = {
    title: `bold 40px ${fontFamily}`,
    name: `bold 13px ${fontFamily}`,
    icon: `35px ${fontFamily}`
};
