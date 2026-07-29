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



    const memberSpacing = 170;

    const childSpacing = 170;

    const parentSpacing = 190;



    const memberY =

        parents.length
            ? 300
            : 180;





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

                    memberY


            });


        }

    );





    /*
        UNIONES
    */


    if (

        members.length > 1

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

                    memberY


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

                    memberY +
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

                    memberY


            });


        }

    );





    /*
        AJUSTE AUTOMÁTICO
    */


    const boxSize = 120;


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





    const padding = 100;



    const width =

        (
            maxX -
            minX
        )
        +
        boxSize
        +
        padding * 2;



    const height =

        (
            maxY -
            minY
        )
        +
        boxSize
        +
        padding * 2;





    /*
        CENTRADO REAL
    */


    const offsetX =

        padding +
        boxSize / 2 -
        minX;



    const offsetY =

        padding +
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
