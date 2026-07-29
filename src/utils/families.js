import {
    getFromDb,
    setInDb
} from './database.js';



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
            )

        );



    if (!familyId)
        return null;



    return await getFromDb(

        familyKey(
            guildId,
            familyId
        )

    );

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
