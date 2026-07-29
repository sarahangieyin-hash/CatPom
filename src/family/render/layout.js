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
        ESPACIADO DINÁMICO
    */


    const memberSpacing =
        Math.max(
            180,
            Math.min(
                320,
                140 + members.length * 45
            )
        );


    const childSpacing =
        Math.max(
            180,
            Math.min(
                280,
                140 + children.length * 35
            )
        );


    const parentSpacing =
        Math.max(
            200,
            Math.min(
                350,
                160 + parents.length * 40
            )
        );



    const centerX =
        Math.max(

            800,

            (
                Math.max(
                    members.length,
                    2
                )
                *
                memberSpacing
            )
            /
            2
            +
            200

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
                    centerX +
                    (
                        index -
                        (members.length - 1) / 2
                    )
                    *
                    memberSpacing,


                y:
                    350

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
                        350

                });


            }


        }


    }





    /*
        HIJOS 👶
    */


    children.forEach(

        (child,index)=>{


            nodes.push({

                id:
                    child.id,


                type:
                    'child',


                x:
                    centerX +
                    (
                        index -
                        (children.length - 1) / 2
                    )
                    *
                    childSpacing,


                y:
                    750

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
                    centerX +
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
                    200 +
                    index *
                    260,


                y:
                    350

            });


        }

    );





    /*
        AJUSTE AUTOMÁTICO DEL LIENZO

        Usa la posición real de los nodos.
        Evita espacios vacíos.
        Centra el árbol.
    */


    const padding =
        250;



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



    const width =

        (
            maxX -
            minX
        )
        +
        padding * 2;



    const height =

        (
            maxY -
            minY
        )
        +
        padding * 2;



    /*
        CENTRAR TODOS LOS NODOS
    */


    nodes.forEach(

        node => {


            node.x -= minX;

            node.x += padding;


            node.y -= minY;

            node.y += padding;


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
