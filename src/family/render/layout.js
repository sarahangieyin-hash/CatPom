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
    */


    const memberSpacing =
        Math.max(
            160,
            Math.min(
                260,
                130 + members.length * 35
            )
        );



    const childSpacing =
        Math.max(
            160,
            Math.min(
                240,
                130 + children.length * 30
            )
        );



    const parentSpacing =
        Math.max(
            180,
            Math.min(
                280,
                150 + parents.length * 35
            )
        );





    /*
        MIEMBROS PRINCIPALES 💍

        Se colocan centrados.
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
                    250

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
                        250

                });


            }


        }


    }





    /*
        HIJOS 👶

        Siempre debajo.
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
                    600

            });


        }

    );





    /*
        PADRES 👨‍👩‍👧

        Arriba, pero sin crear
        espacio enorme.
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
                    60

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
                    -250 +
                    index * 220,


                y:
                    250

            });


        }

    );





    /*
        AJUSTE DEL LIENZO

        - Sin espacio vacío arriba.
        - Crece hacia abajo con hijos.
        - Centrado horizontal.
    */


    const visibleNodes =

        nodes.filter(

            node =>
                node.type !== 'union'

        );



    const minX =
        Math.min(

            ...visibleNodes.map(
                node => node.x
            )

        );



    const maxX =
        Math.max(

            ...visibleNodes.map(
                node => node.x
            )

        );



    const minY =
        Math.min(

            ...visibleNodes.map(
                node => node.y
            )

        );



    const maxY =
        Math.max(

            ...visibleNodes.map(
                node => node.y
            )

        );





    const marginX =
        120;



    const marginTop =
        80;



    const marginBottom =
        120;





    const width =

        Math.max(

            800,

            (
                maxX -
                minX
            )
            +
            marginX * 2

        );





    const height =

        Math.max(

            650,

            (
                maxY -
                minY
            )
            +
            marginTop +
            marginBottom

        );





    /*
        CENTRAR SOLO HORIZONTALMENTE
    */


    const offsetX =

        (
            width -
            (
                maxX -
                minX
            )
        )
        /
        2
        -
        minX;



    const offsetY =

        marginTop -
        minY;





    nodes.forEach(

        node => {

            node.x += offsetX;

            node.y += offsetY;

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
