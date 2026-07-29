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
        ESPACIADOS
    */


    const memberSpacing =
        Math.max(
            180,
            Math.min(
                300,
                180 + members.length * 35
            )
        );



    const childSpacing =
        Math.max(
            180,
            Math.min(
                280,
                180 + children.length * 40
            )
        );



    const parentSpacing =
        Math.max(
            200,
            Math.min(
                320,
                200 + parents.length * 40
            )
        );





    /*
        TAMAÑO DINÁMICO

        El lienzo crece según la familia,
        pero mantiene el centro.
    */


    const maxHorizontalNodes =
        Math.max(
            members.length,
            children.length,
            parents.length,
            siblings.length,
            2
        );



    const width =
        Math.max(

            1200,

            (
                maxHorizontalNodes *
                220
            )
            +
            700

        );



    const height =
        Math.max(

            900,

            500 +

            children.length *
            160 +

            parents.length *
            100

        );





    /*
        CENTRO REAL DEL CANVAS
    */


    const centerX =
        width / 2;





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


        for(
            let i = 0;
            i < members.length - 1;
            i++
        ){


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



            if(
                left &&
                right
            ){


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
                    700

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

                    centerX +

                    (
                        index -
                        (siblings.length - 1) / 2
                    )
                    *
                    220,


                y:
                    350

            });


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
