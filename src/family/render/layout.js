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


    const unionNodes = [];


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


                const union = {


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


                };


                unionNodes.push(union);


                nodes.push(union);


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
                    200 +
                    index *
                    260,


                y:
                    350

            });


        }

    );





    /*
        TAMAÑO DINÁMICO DEL LIENZO

        Aumenta SOLO si hay más familia.
    */


    const totalPeople =

        members.length +
        children.length +
        parents.length +
        siblings.length;



    const width =

        Math.max(

            1600,

            (
                totalPeople *
                220
            )
            +
            700

        );



    const height =

        Math.max(

            1000,

            900 +
            (
                children.length *
                120
            )

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
