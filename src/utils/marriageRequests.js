import {
    getFromDb,
    setInDb,
    deleteFromDb
} from './database/wrapper.js';


function key(
    guildId,
    userId
) {

    return `marriageRequest:${guildId}:${userId}`;

}



export async function createMarriageRequest(
    guildId,
    from,
    to
) {

    await setInDb(

        key(guildId, to),

        {
            from,
            to,
            createdAt: Date.now()

        }

    );

}



export async function getMarriageRequest(
    guildId,
    userId
) {

    return await getFromDb(

        key(guildId, userId),

        null

    );

}



export async function deleteMarriageRequest(
    guildId,
    userId
) {

    await deleteFromDb(

        key(guildId, userId)

    );

}
