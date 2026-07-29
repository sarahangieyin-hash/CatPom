export async function calculateLayout(
    guild,
    family
) {


    const members =
        Array.isArray(
            family.members
        )
            ? family.members
            : [];



    const children =
        Array.isArray(
            family.children
        )
            ? family.children
            : [];



    const lovers =
        Array.isArray(
            family.lovers
        )
            ? family.lovers
            : [];



    const nodes = [];



    const centerY = 250;


    const memberSpacing = 220;



    members.forEach(
        (id, index) => {


            nodes.push({

                id,

                type:
                    'member',

                x:
                    300 +
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



    children.forEach(
        (child, index) => {


            nodes.push({

                id:
                    child.id,

                type:
                    'child',

                x:
                    300 +
                    (
                        index -
                        (children.length - 1) / 2
                    )
                    *
                    memberSpacing,

                y:
                    550


            });


        }

    );



    lovers.forEach(
        (id, index) => {


            nodes.push({

                id,

                type:
                    'lover',

                x:
                    100 +
                    index *
                    180,

                y:
                    100


            });


        }

    );



    return {


        width:
            Math.max(
                1200,
                members.length *
                memberSpacing
            ),


        height:
            800,


        nodes,


        members,


        children,


        lovers

    };

}
