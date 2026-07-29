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





    /*
        ESPACIADO
    */


    const memberSpacing =

        Math.max(

            160,

            Math.min(

                280,

                160 +
                members.length * 35

            )

        );



    const childSpacing =

        Math.max(

            160,

            Math.min(

                260,

                160 +
                children.length * 30

            )

        );



    const parentSpacing =

        Math.max(

            180,

            Math.min(

                280,

                180 +
                parents.length * 35

            )

        );





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

                    parents.length
                        ? 350
                        : 250


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

                nodes.find(

                    node =>

                        node.type === 'member' &&

                        node.id === members[i]

                );



            const right =

                nodes.find(

                    node =>

                        node.type === 'member' &&

                        node.id === members[i + 1]

                );



            if (

                left &&
                right

            ) {


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

                        left.y


                });


            }


        }


    }





    /*
        HIJOS 👶

        Siempre crecen hacia abajo.
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

                    650 +
                    Math.floor(index / 5)
                    *
                    120


            });


        }

    );





    /*
        PADRES 👨‍👩‍👧
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

                    120


            });


        }

    );





    /*
        HERMANOS 👥
    */


    siblings.forEach(

        (sibling,index)=>{


            nodes.push({

                id:
                    sibling.id,


                type:
                    'sibling',


                x:

                    -350 +
                    index * 220,


                y:

                    parents.length
                        ? 350
                        : 250


            });


        }

    );





    /*
        TAMAÑO DEL LIENZO

        Parejas -> ancho
        Hijos -> abajo
        Padres -> arriba
    */


    const memberWidth =

        Math.max(

            1,

            members.length

        )
        *
        memberSpacing;



    const width =

        Math.max(

            900,

            memberWidth +
            400

        );



    const height =

        Math.max(

            700,

            (
                parents.length
                    ? 250
                    : 0
            )
            +
            700
            +
            (
                children.length *
                80
            )

        );





    /*
        CENTRADO HORIZONTAL REAL
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



    const contentCenter =

        (
            minX +
            maxX
        )
        /
        2;



    const offsetX =

        (
            width /
            2
        )
        -
        contentCenter;



    nodes.forEach(

        node => {


            node.x += offsetX;


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
