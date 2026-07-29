import {
    getFromDb,
    setInDb
} from './database/wrapper.js';



function familyKey(
    guildId,
    familyId
) {

    return `family:${guildId}:${familyId}`;

}



function memberFamilyKey(
    guildId,
    userId
) {

    return `familyMember:${guildId}:${userId}`;

}





export async function createFamily(
    guildId,
    members = []
) {


    const id =
        Date.now().toString();



    const family = {

        id,

        /*
            SOLO ADULTOS / PAREJAS
        */

        members,


        /*
            HIJOS INDEPENDIENTES
        */

        children: [],


        parents: [],


        siblings: [],


        lovers: [],


        createdAt:
            Date.now()

    };





    await setInDb(

        familyKey(
            guildId,
            id
        ),

        family

    );





    for (
        const member of members
    ) {


        await setInDb(

            memberFamilyKey(
                guildId,
                member
            ),

            id

        );


    }





    return family;

}







export async function getFamilyByMember(
    guildId,
    userId
) {


    const familyId =

        await getFromDb(

            memberFamilyKey(
                guildId,
                userId
            ),

            null

        );



    if (!familyId)
        return null;





    const family =

        await getFromDb(

            familyKey(
                guildId,
                familyId
            ),

            null

        );



    if (!family)
        return null;





    /*
        REPARACIÓN DE ESTRUCTURA
    */



    if (
        !Array.isArray(
            family.members
        )
    ) {

        family.members = [];

    }



    if (
        !Array.isArray(
            family.children
        )
    ) {

        family.children = [];

    }



    if (
        !Array.isArray(
            family.parents
        )
    ) {

        family.parents = [];

    }



    if (
        !Array.isArray(
            family.siblings
        )
    ) {

        family.siblings = [];

    }



    if (
        !Array.isArray(
            family.lovers
        )
    ) {

        family.lovers = [];

    }







    /*
        NO METER HIJOS COMO MIEMBROS

        Un hijo adoptado sigue siendo hijo,
        aunque la familia tenga nuevos matrimonios.
    */



    const child =

        family.children.some(

            c =>
                c.id === userId

        );



    const parent =

        family.parents.some(

            p =>
                p.id === userId

        );



    const sibling =

        family.siblings.some(

            s =>
                s.id === userId

        );







    if (

        !family.members.includes(userId)

        &&

        !child

        &&

        !parent

        &&

        !sibling

    ) {


        family.members.push(
            userId
        );



        await setInDb(

            familyKey(
                guildId,
                familyId
            ),

            family

        );


    }







    return family;

}







export async function isUserInFamily(
    guildId,
    userId
) {


    const family =

        await getFamilyByMember(

            guildId,

            userId

        );



    return family !== null;

}







export async function updateFamily(
    guildId,
    familyId,
    family
) {


    await setInDb(

        familyKey(
            guildId,
            familyId
        ),

        family

    );



    return family;

}







export async function cleanFamilyChildren(
    guildId,
    familyId
) {


    const family =

        await getFromDb(

            familyKey(
                guildId,
                familyId
            ),

            null

        );



    if (!family)
        return null;



    family.children = [];



    await setInDb(

        familyKey(
            guildId,
            familyId
        ),

        family

    );



    return family;

}







/*
    COMPROBACIÓN DE UNIONES 💍

    Bloquea:
    - hijos
    - padres
    - hermanos

    Permite:
    - personas externas
    - poliamor
*/



export function canMarry(
    family,
    userId
) {


    if (!family)
        return true;





    if (

        family.children?.some(

            child =>
                child.id === userId

        )

    ) {

        return false;

    }





    if (

        family.parents?.some(

            parent =>
                parent.id === userId

        )

    ) {

        return false;

    }





    if (

        family.siblings?.some(

            sibling =>
                sibling.id === userId

        )

    ) {

        return false;

    }





    return true;

}
