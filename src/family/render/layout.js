export async function calculateLayout(
    guild,
    family
) {


    const members =
        Array.isArray(family.members)
            ? family.members
            : [];


    const children =
        Array.isArray(family.children)
            ? family.children
            : [];


    const parents =
        Array.isArray(family.parents)
            ? family.parents
            : [];


    const siblings =
        Array.isArray(family.siblings)
            ? family.siblings
            : [];


    const lovers =
        Array.isArray(family.lovers)
            ? family.lovers
            : [];



    const nodes = [];



    const memberSpacing =
        Math.max(
            160,
            Math.min(
                260,
                150 + members.length * 25
            )
        );



    const childSpacing =
        Math.max(
            160,
            Math.min(
                240,
                150 + children.length * 25
            )
        );



    const parentSpacing =
        Math.max(
            180,
            Math.min(
                280,
                170 + parents.length * 25
            )
        );



    const centerY = 300;





    /*
        MIEMBROS PRINCIPALES
    */


    members.forEach(

        (id,index)=>{


            nodes.push({

                id,

                type:
                    'member',


                x:

                    (
                        index -
                        (members.length - 1) / 2
                    )
                    *
                    memberSpacing,


                y:

                    centerY


            });


        }

    );





    /*
        UNIONES
    */


    if (

        members.length >= 2

    ) {


        for (

            let i = 0;

            i < members.length - 1;

            i++

        ) {


            const left =
                nodes[i];


            const right =
                nodes[i + 1];



            nodes.push({

                type:
                    'union',


                x:

                    (
                        left.x +
                        right.x
                    )
                    /
                    2,


                y:

                    centerY


            });


        }


    }





    /*
        HIJOS
    */


    children.forEach(

        (child,index)=>{


            nodes.push({

                id:
                    child.id,


                type:
                    'child',


                x:

                    (
                        index -
                        (children.length - 1) / 2
                    )
                    *
                    childSpacing,


                y:

                    centerY +
                    380


            });


        }

    );





    /*
        PADRES
    */


    parents.forEach(

        (parent,index)=>{


            nodes.push({

                id:
                    parent.id,


                type:
                    'parent',


                x:

                    (
                        index -
                        (parents.length - 1) / 2
                    )
                    *
                    parentSpacing,


                y:

                    80


            });


        }

    );





    /*
        HERMANOS
    */


    siblings.forEach(

        (sibling,index)=>{


            nodes.push({

                id:
                    sibling.id,


                type:
                    'sibling',


                x:

                    -250 -
                    index * 200,


                y:

                    centerY


            });


        }

    );





    /*
        TAMAÑO DEL LIENZO
        (ALTURA NO TOCADA)
    */


    const visibleNodes =

        nodes.filter(

            node =>
                node.type !== 'union'

        );



    const minX =

        Math.min(

            ...visibleNodes.map(

                node =>
                    node.x

            )

        );



    const maxX =

        Math.max(

            ...visibleNodes.map(

                node =>
                    node.x

            )

        );



    const minY =

        Math.min(

            ...visibleNodes.map(

                node =>
                    node.y

            )

        );



    const maxY =

        Math.max(

            ...visibleNodes.map(

                node =>
                    node.y

            )

        );





    const boxSize = 120;


    const paddingX = 100;


    const paddingY = 100;





    /*
        ANCHO CORREGIDO

        Usa el lado más grande
        para que ambos lados
        sean iguales.
    */


    const sideSpace =

        Math.max(

            Math.abs(minX),

            Math.abs(maxX)

        );



    const width =

        (
            sideSpace * 2
        )
        +
        boxSize
        +
        paddingX;





    /*
        ALTURA ORIGINAL
    */


    const height =

        (
            maxY -
            minY
        )
        +
        boxSize
        +
        paddingY * 2;





    /*
        CENTRADO
    */


    const offsetX =

        width / 2;



    const offsetY =

        paddingY +
        boxSize / 2 -
        minY;



    nodes.forEach(

        node => {


            node.x += offsetX;


            node.y += offsetY;


        }

    );





    return {


        width,


        height,


        guild,


        nodes,


        members,


        children,


        parents,


        siblings,


        lovers


    };


}
