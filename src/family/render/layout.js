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

        Pocas personas = compacto.
        Muchas personas = se separa.
    */


    const memberSpacing =
        Math.max(
            150,
            Math.min(
                280,
                120 + members.length * 35
            )
        );



    const childSpacing =
        Math.max(
            150,
            Math.min(
                250,
                120 + children.length * 20
            )
        );



    const parentSpacing =
        Math.max(
            180,
            Math.min(
                300,
                150 + parents.length * 30
            )
        );



    const centerX =
        Math.max(
            600,
            (
                Math.max(
                    members.length,
                    2
                )
                *
                memberSpacing
            ) / 2
            +
            200
        );





    /*
        PERSONAS PRINCIPALES 💍

        Siempre horizontal:

        Persona - anillo - Persona - anillo - Persona
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
                    300

            });


        }

    );





    /*
        NODOS DE UNIÓN 💍

        Crea un punto invisible entre
        cada pareja para conectar hijos,
        padres y anillos.

        Ejemplo:

        A - 💍 - B - 💍 - C
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
                        300

                });


            }


        }


    }
        /*
        HIJOS 👶

        Siempre debajo de la unión.
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
                    650

            });


        }

    );





    /*
        PADRES 👨‍👩‍👧

        Encima de la unión.
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
                    80

            });


        }

    );





    /*
        HERMANOS 👥

        Lateral.
    */


    siblings.forEach(

        (sibling,index)=>{


            nodes.push({

                id:
                    sibling.id,


                type:
                    'sibling',


                x:
                    150 +
                    index *
                    220,


                y:
                    300

            });


        }

    );





    /*
        AJUSTE DE TAMAÑO

        Se adapta al crecimiento
        de la familia.
    */


    const width =
        Math.max(

            1200,

            members.length *
            memberSpacing
            +
            500

        );



    const height =
        Math.max(

            900,

            children.length *
            80
            +
            900

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
