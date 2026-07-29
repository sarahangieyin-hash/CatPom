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



    const centerX = 800;



    /*
        NODO CENTRAL DE UNIÓN 💍

        No se dibuja.
        Sirve para conectar pareja e hijos.
    */

    nodes.push({

        id:
            'union_main',

        type:
            'union',

        x:
            centerX,

        y:
            300

    });



    /*
        MIEMBROS DE LA UNIÓN 💍

        Siempre en línea horizontal.
        Ej:
        A - 💍 - B - 💍 - C
    */

    members.forEach(

        (id, index) => {


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
                    180,


                y:
                    300

            });


        }

    );



    /*
        HIJOS 👶

        Siempre debajo del centro de la unión.
    */

    children.forEach(

        (child, index) => {


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
                    240,


                y:
                    650

            });


        }

    );



    /*
        PADRES 👨‍👩‍👧

        Arriba del núcleo familiar.
    */

    parents.forEach(

        (parent, index) => {


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
                    280,


                y:
                    100

            });


        }

    );



    /*
        HERMANOS 👥
    */

    siblings.forEach(

        (sibling, index) => {


            nodes.push({

                id:
                    sibling.id,


                type:
                    'sibling',


                x:
                    150 +
                    index * 230,


                y:
                    300

            });


        }

    );



    return {


        width:
            1800,


        height:
            1000,


        guild,


        nodes,


        members,


        children,


        parents,


        siblings,


        lovers


    };


}
