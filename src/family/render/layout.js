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
        ANILLO DE UNIÓN 💍
        Siempre en medio de la pareja
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
        PAREJAS 👩 💍 👨
        Siempre alrededor del anillo
    */

    const radius = 180;


    members.forEach(

        (id, index) => {


            const total =
                members.length;


            const angle =
                (
                    Math.PI *
                    2 *
                    index /
                    total
                )
                -
                Math.PI / 2;



            nodes.push({

                id,

                type:
                    'member',


                x:
                    centerX +
                    Math.cos(angle) *
                    radius,


                y:
                    300 +
                    Math.sin(angle) *
                    radius / 2

            });


        }

    );



    /*
        HIJOS 👶
        Siempre debajo del matrimonio
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
        Arriba conectados al anillo
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
