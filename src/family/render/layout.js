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
        NODO DE UNIÓN 💍
        Invisible.
        Sirve para conectar padres e hijos.
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
        PAREJA PRINCIPAL 💍
        Siempre horizontal.
        Ej:
        Madre - Padre
        Madre - Padre - Pareja
    */

    const memberSpacing = 220;


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
                    memberSpacing,


                y:
                    300

            });


        }

    );



    /*
        HIJOS 👶
        Siempre debajo de TODA la unión.
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
        Encima de la pareja.
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
                    80

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
