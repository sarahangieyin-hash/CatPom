export const familyTheme = {


    /*
        FONDO DEL ÁRBOL 🌳

        El renderer usará este color
        cuando no haya imagen.
    */

    background:
        '#111111',



    /*
        TAMAÑO BASE DEL FONDO

        Se usa como referencia.
        El tamaño real aumenta según
        los miembros del árbol.
    */


    backgroundSize: {

        minWidth:
            1600,


        minHeight:
            1000,


        memberGrowth:
            180,


        childGrowth:
            120

    },





    /*
        LÍNEAS
    */


    marriageLine:
        '#ffffff',


    childLine:
        '#ffffff',





    /*
        NODOS
    */


    memberNode:
        '#ffd166',


    childNode:
        '#7ec8ff',


    parentNode:
        '#ff9f9f',


    siblingNode:
        '#c77dff',





    /*
        BORDE Y TEXTO
    */


    border:
        '#ffffff',


    text:
        '#ffffff',





    /*
        ICONOS
    */


    icons: {


        marriage:
            '💍',


        lover:
            '🔥',


        child:
            '👶'


    }


};
