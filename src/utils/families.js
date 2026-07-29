import {
    getFromDb,
    setInDb,
    listFromDb,
    deleteFromDb
} from './database/wrapper.js';


function familyKey(guildId, id) {

    return `family:${guildId}:${id}`;

}



export async function createFamily(
    guildId,
    id,
    data
) {

    await setInDb(

        familyKey(guildId, id),

        {

            id,

            ...data,

            active: true,

            createdAt: Date.now()

        }

    );


    return data;

}



export async function getFamily(
    guildId,
    id
) {

    return await getFromDb(

        familyKey(guildId, id),

        null

    );

}



export async function updateFamily(
    guildId,
    id,
    data
) {

    await setInDb(

        familyKey(guildId, id),

        {

            ...data

        }

    );

}



export async function deleteFamily(
    guildId,
    id
) {

    await deleteFromDb(

        familyKey(guildId, id)

    );

}



export async function getAllFamilies(
    guildId
) {

    const families =
        await listFromDb(
            `family:${guildId}:`
        );


    return families.map(family => {


        if (family.value) {


            return {

                id:
                    family.key.split(':').pop(),

                ...family.value

            };


        }


        return family;


    });


}



export async function getFamilyByMember(
    guildId,
    userId
) {

    const families =
        await getAllFamilies(guildId);



    return families.find(
        family =>

            family.active !== false &&

            Array.isArray(
                family.members
            ) &&

            family.members.includes(
                userId
            )

    ) || null;


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


    return Boolean(family);

}



export async function addMemberToFamily(
    guildId,
    familyId,
    userId
) {

    const family =
        await getFamily(
            guildId,
            familyId
        );


    if (!family)
        return false;



    if (!Array.isArray(family.members)) {

        family.members = [];

    }



    if (
        !family.members.includes(
            userId
        )
    ) {

        family.members.push(
            userId
        );

    }



    await updateFamily(

        guildId,

        familyId,

        family

    );


    return true;

}



export async function removeMemberFromFamily(
    guildId,
    familyId,
    userId
) {

    const family =
        await getFamily(
            guildId,
            familyId
        );


    if (!family)
        return false;



    family.members =
        family.members.filter(
            id =>
                id !== userId
        );



    await updateFamily(

        guildId,

        familyId,

        family

    );


    return true;

}
