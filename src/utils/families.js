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

        members,

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
        REPARACIÓN

        Solo añade miembros principales.

        NO mete hijos,
        NO mete padres,
        NO mete hermanos.

        Los hijos son independientes.
    */



    if (
        !Array.isArray(
            family.members
        )
    ) {

        family.members = [];

    }



    if (
        !family.children
    ) {

        family.children = [];

    }



    if (
        !family.parents
    ) {

        family.parents = [];

    }



    if (
        !family.siblings
    ) {

        family.siblings = [];

    }



    if (
        !family.lovers
    ) {

        family.lovers = [];

    }





    /*
        Solo reparar si el usuario
        ya era miembro de la familia.

        NO añadir hijos automáticamente.
    */


    const isChild =

        family.children.some(

            child =>

                child.id === userId

        );



    const isParent =

        family.parents.some(

            parent =>

                parent.id === userId

        );



    const isSibling =

        family.siblings.some(

            sibling =>

                sibling.id === userId

        );





    if (

        !family.members.includes(userId)

        &&

        !isChild

        &&

        !isParent

        &&

        !isSibling

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
