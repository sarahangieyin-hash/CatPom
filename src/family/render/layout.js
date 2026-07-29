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



    const centerX = 600;



    /*
        UNIÓN PRINCIPAL 💍
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
                    350

            });


        }

    );



    /*
        HIJOS 👶
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
                    180,


                y:
                    650

            });


        }

    );



    /*
        PADRES 👨‍👩‍👧
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
                    220,


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
                    index *
                    220,


                y:
                    350

            });


        }

    );



    /*
        AMANTES 🔥
        
        NO SE AÑADEN A NODES.
        Solo se pasan a drawIcons.js
        para mostrar el fuego.
    */



    return {


        width:
            1400,


        height:
            900,


        nodes,


        members,


        children,


        parents,


        siblings,


        lovers

    };

}
