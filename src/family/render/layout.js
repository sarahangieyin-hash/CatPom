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


    const centerX = 700;



    /*
        PAREJA PRINCIPAL 💍
    */

    members.forEach(

        (id, index) => {

            nodes.push({

                id,

                type: 'member',

                x:
                    centerX +
                    (
                        index -
                        (members.length - 1) / 2
                    )
                    *
                    260,

                y: 250

            });

        }

    );



    /*
        HIJOS 👶
    */

    children.forEach(

        (child, index) => {

            nodes.push({

                id: child.id,

                type: 'child',

                x:
                    centerX +
                    (
                        index -
                        (children.length - 1) / 2
                    )
                    *
                    220,

                y: 600

            });

        }

    );



    /*
        PADRES 👨‍👩‍👧
    */

    parents.forEach(

        (parent, index) => {

            nodes.push({

                id: parent.id,

                type: 'parent',

                x:
                    centerX +
                    (
                        index -
                        (parents.length - 1) / 2
                    )
                    *
                    260,

                y: 80

            });

        }

    );



    /*
        HERMANOS 👥
    */

    siblings.forEach(

        (sibling, index) => {

            nodes.push({

                id: sibling.id,

                type: 'sibling',

                x:
                    150 +
                    index * 220,

                y: 250

            });

        }

    );



    return {

        width: 1600,

        height: 900,

        guild,

        nodes,

        members,

        children,

        parents,

        siblings,

        lovers

    };

}
