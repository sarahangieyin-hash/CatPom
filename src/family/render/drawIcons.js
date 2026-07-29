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


    const members =
        layout.nodes.filter(
            node =>
                node.type === 'member'
        );


    const lovers =
        layout.lovers || [];



    /*
        💍 ANILLOS ENTRE PERSONAS

        👤 💍 👤 💍 👤
    */


    if (members.length > 1) {


        const ring =
            new Image();


        ring.src =
            ringPath;



        for (
            let i = 0;
            i < members.length - 1;
            i++
        ) {


            const left =
                members[i];


            const right =
                members[i + 1];



            const x =
                (
                    left.x +
                    right.x
                )
                /
                2;



            const y =
                left.y;



            const size =
                45;



            ctx.drawImage(

                ring,

                x - size / 2,

                y - size / 2,

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
