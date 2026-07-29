import {
    Image
} from 'canvas';

import path from 'path';

import {
    fileURLToPath
} from 'url';


const __filename =
    fileURLToPath(import.meta.url);


const __dirname =
    path.dirname(__filename);



const ringPath =
    path.join(
        __dirname,
        '../../assets/icons/ring.png'
    );



export async function drawIcons(
    ctx,
    layout
) {


    const unions =
        layout.nodes.filter(
            node =>
                node.type === 'union'
        );


    const members =
        layout.nodes.filter(
            node =>
                node.type === 'member'
        );


    const lovers =
        layout.lovers || [];



    /*
        💍 ANILLOS

        Persona - 💍 - Persona - 💍 - Persona

        Usa los nodos union creados
        por calculateLayout()
    */


    if (
        unions.length
    ) {


        const ring =
            new Image();


        ring.src =
            ringPath;



        for (
            const union of unions
        ) {


            const size =
                45;



            ctx.drawImage(

                ring,

                union.x - size / 2,

                union.y - size / 2,

                size,

                size

            );


        }


    }





    /*
        🔥 AMANTES
    */


    members.forEach(

        member => {


            if (
                lovers.includes(
                    member.id
                )
            ) {


                ctx.font =
                    "28px Arial";


                ctx.fillText(

                    "🔥",

                    member.x + 45,

                    member.y - 45

                );


            }


        }

    );


}
