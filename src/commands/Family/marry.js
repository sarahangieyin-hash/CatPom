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



    return await getFromDb(

        familyKey(
            guildId,
            familyId
        ),

        null

    );

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
