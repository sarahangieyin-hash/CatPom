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
        ESPACIADO

        Crece solo horizontalmente
        cuando hay más parejas.
    */


    const memberSpacing =

        Math.max(

            180,

            Math.min(

                300,

                180 +
                members.length * 35

            )

        );



    const childSpacing =

        Math.max(

            180,

            Math.min(

                260,

                180 +
                children.length * 30

            )

        );



    const parentSpacing =

        Math.max(

            200,

            Math.min(

                300,

                200 +
                parents.length * 30

            )

        );





    /*
        MIEMBROS PRINCIPALES 💍

        Siempre en línea horizontal.
    */


    members.forEach(

        (id,index)=>{


            nodes.push({

                id,

                type:
                    'member',


                x:

                    (
                        index -
                        (members.length - 1) / 2
                    )
                    *
                    memberSpacing,


                y:

                    parents.length
                        ? 350
                        : 250


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

                        left.y


                });


            }


        }


    }





    /*
        HIJOS 👶

        Siempre crecen hacia abajo.
    */


    children.forEach(

        (child,index)=>{


            nodes.push({

                id:
                    child.id,


                type:
                    'child',


                x:

                    (
                        index -
                        (children.length - 1) / 2
                    )
                    *
                    childSpacing,


                y:

                    650 +
                    (
                        Math.floor(index / 5)
                        *
                        120
                    )


            });


        }

    );





    /*
        PADRES 👨‍👩‍👧

        Solo ocupan arriba si existen.
    */


    parents.forEach(

        (parent,index)=>{


            nodes.push({

                id:
                    parent.id,


                type:
                    'parent',


                x:

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

        Laterales.
    */


    siblings.forEach(

        (sibling,index)=>{


            nodes.push({

                id:
                    sibling.id,


                type:
                    'sibling',


                x:

                    -350 +
                    index * 220,


                y:

                    parents.length
                        ? 350
                        : 250


            });


        }

    );





    /*
        TAMAÑO DEL LIENZO

        Parejas = ancho.
        Hijos = alto.
        Sin padres = no hay espacio arriba.
    */


    const memberWidth =

        Math.max(

            1,

            members.length

        )
        *
        memberSpacing;



    const childrenHeight =

        children.length > 0

            ? 450 +
              Math.ceil(children.length / 5)
              *
              120

            : 250;



    const parentsHeight =

        parents.length > 0

            ? 250

            : 50;



    const width =

        Math.max(

            900,

            memberWidth +
            500

        );



    const height =

        Math.max(

            700,

            parentsHeight +
            900 +
            (
                children.length *
                30
            )

        );





    /*
        CENTRAR HORIZONTALMENTE

        NO centrar verticalmente.
    */


    const offsetX =

        width / 2;



    nodes.forEach(

        node => {


            node.x += offsetX;


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
