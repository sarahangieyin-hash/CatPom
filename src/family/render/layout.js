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



    const memberSpacing =
        170;


    const childSpacing =
        170;


    const parentSpacing =
        190;





    /*
        POSICIONES BASE
    */


    const mainY =
        parents.length
            ? 260
            : 180;



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
                    mainY


            });


        }

    );





    /*
        UNIONES
    */


    if (

        members.length > 1

    ) {


        for (

            let i = 0;

            i < members.length - 1;

            i++

        ) {


            const a =
                nodes[i];


            const b =
                nodes[i + 1];



            nodes.push({

                type:
                    'union',


                x:

                    (
                        a.x +
                        b.x
                    )
                    /
                    2,


                y:
                    mainY


            });


        }


    }





    /*
        HIJOS
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

                    mainY +
                    380


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

                    -260 -
                    index * 200,


                y:
                    mainY


            });


        }

    );





    /*
        AJUSTE AUTOMÁTICO DEL LIENZO
    */


    const paddingX =
        180;


    const paddingTop =

        parents.length
            ? 120
            : 80;


    const paddingBottom =
        120;



    const realNodes =

        nodes.filter(

            n =>
                n.type !== 'union'

        );



    const minX =

        Math.min(

            ...realNodes.map(

                n =>
                    n.x

            )

        );



    const maxX =

        Math.max(

            ...realNodes.map(

                n =>
                    n.x

            )

        );



    const minY =

        Math.min(

            ...realNodes.map(

                n =>
                    n.y

            )

        );



    const maxY =

        Math.max(

            ...realNodes.map(

                n =>
                    n.y

            )

        );





    const contentWidth =

        maxX -
        minX;



    const contentHeight =

        maxY -
        minY;





    const width =

        Math.max(

            900,

            contentWidth +
            paddingX * 2

        );



    const height =

        Math.max(

            600,

            contentHeight +
            paddingTop +
            paddingBottom

        );





    /*
        CENTRAR CONTENIDO
    */


    const offsetX =

        (
            width -
            contentWidth
        )
        /
        2
        -
        minX;



    const offsetY =

        paddingTop -
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
