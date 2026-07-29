export async function drawLines(
    ctx,
    layout
) {


    const members =
        layout.nodes.filter(
            node =>
                node.type === 'member'
        );


    const children =
        layout.nodes.filter(
            node =>
                node.type === 'child'
        );


    const parents =
        layout.nodes.filter(
            node =>
                node.type === 'parent'
        );


    const siblings =
        layout.nodes.filter(
            node =>
                node.type === 'sibling'
        );



    ctx.strokeStyle =
        '#ffffff';


    ctx.lineWidth =
        3;



    /*
        UNIÓN 💍
    */


    if (
        members.length > 1
    ) {


        ctx.beginPath();


        ctx.moveTo(

            members[0].x,

            members[0].y

        );


        ctx.lineTo(

            members[members.length - 1].x,

            members[members.length - 1].y

        );


        ctx.stroke();


    }



    /*
        HIJOS 👶
    */


    if (
        members.length > 0 &&
        children.length > 0
    ) {


        const centerX =

            members.reduce(

                (sum,node) =>
                    sum + node.x,

                0

            )
            /
            members.length;



        ctx.beginPath();


        ctx.moveTo(

            centerX,

            members[0].y

        );


        ctx.lineTo(

            centerX,

            children[0].y - 70

        );


        ctx.stroke();



        children.forEach(

            child => {


                ctx.beginPath();


                ctx.moveTo(

                    centerX,

                    children[0].y - 70

                );


                ctx.lineTo(

                    child.x,

                    child.y

                );


                ctx.stroke();


            }

        );

    }



    /*
        PADRES 👨‍👩‍👧
    */


    if (
        parents.length > 0 &&
        members.length > 0
    ) {


        parents.forEach(

            parent => {


                ctx.beginPath();


                ctx.moveTo(

                    parent.x,

                    parent.y

                );


                ctx.lineTo(

                    members[0].x,

                    members[0].y - 60

                );


                ctx.stroke();


            }

        );

    }



    /*
        HERMANOS 👥
    */


    if (
        siblings.length > 0 &&
        members.length > 0
    ) {


        siblings.forEach(

            sibling => {


                ctx.beginPath();


                ctx.moveTo(

                    sibling.x,

                    sibling.y

                );


                ctx.lineTo(

                    members[0].x,

                    members[0].y

                );


                ctx.stroke();


            }

        );

    }

}
