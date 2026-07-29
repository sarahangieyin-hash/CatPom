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
                300,
                170 + members.length * 35
            )
        );



    const childSpacing =

        Math.max(
            150,
            Math.min(
                260,
                160 + children.length * 25
            )
        );



    const parentSpacing =

        Math.max(
            170,
            Math.min(
                280,
                170 + parents.length * 25
            )
        );



    const centerY =
        250;





    /*
        MIEMBROS PRINCIPALES 💍
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
        UNIONES 💍
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
        HIJOS 👶

        Hijos adoptados:
        permanecen ligados a su padre.

        Hijos sin padre:
        pertenecen a la unión.

    */


    const individualChildren =

        children.filter(

            child =>
                child.parent

        );



    const sharedChildren =

        children.filter(

            child =>
                !child.parent

        );





    /*
        HIJOS INDIVIDUALES
    */


    individualChildren.forEach(

        (child,index)=>{


            const parentNode =

                nodes.find(

                    node =>

                        node.type === 'member' &&

                        node.id === child.parent

                );



            if (parentNode) {


                nodes.push({

                    id:
                        child.id,


                    type:
                        'child',


                    parent:
                        child.parent,


                    x:

                        parentNode.x +
                        (
                            index * 140
                        ),


                    y:

                        centerY + 350


                });


            } else {


                nodes.push({

                    id:
                        child.id,


                    type:
                        'child',


                    x:

                        (
                            index -
                            (
                                individualChildren.length - 1
                            ) / 2
                        )
                        *
                        childSpacing,


                    y:

                        centerY + 350


                });


            }


        }

    );





    /*
        HIJOS DE LA UNIÓN
    */


    sharedChildren.forEach(

        (child,index)=>{


            nodes.push({

                id:
                    child.id,


                type:
                    'child',


                x:

                    (
                        index -
                        (
                            sharedChildren.length - 1
                        ) / 2
                    )
                    *
                    childSpacing,


                y:

                    centerY + 350


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
                        (
                            parents.length - 1
                        ) / 2
                    )
                    *
                    parentSpacing,


                y:

                    centerY - 220


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
                    (
                        index * 180
                    ),


                y:

                    centerY


            });


        }

    );





    /*
        LIMITES REALES
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





    const boxSize =
        120;



    const marginX =
        180;


    const marginY =
        120;





    const width =

        Math.max(

            900,

            (
                maxX -
                minX
            )
            +
            boxSize
            +
            marginX

        );



    const height =

        Math.max(

            700,

            (
                maxY -
                minY
            )
            +
            boxSize
            +
            marginY

        );





    /*
        CENTRADO REAL

        Mismo espacio izquierda/derecha.
    */


    const offsetX =

        (
            width -
            (
                maxX - minX
            )

        )
        /
        2
        -
        minX;



    const offsetY =

        80 -
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
