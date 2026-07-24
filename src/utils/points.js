import { getFromDb, setInDb } from './database.js';


function getPompKey(guildId, userId) {
    return `guild:${guildId}:pomp:${userId}`;
}


export async function getPomp(guildId, userId) {

    const data = await getFromDb(
        getPompKey(guildId, userId),
        { points: 0 }
    );

    return Number(data.points || 0);
}



export async function addPomp(guildId, userId, amount) {

    const current = await getPomp(
        guildId,
        userId
    );

    const total = current + amount;


    await setInDb(
        getPompKey(guildId, userId),
        {
            points: total
        }
    );


    return total;
}



export async function removePomp(guildId, userId, amount) {

    const current = await getPomp(
        guildId,
        userId
    );


    const total = Math.max(
        0,
        current - amount
    );


    await setInDb(
        getPompKey(guildId, userId),
        {
            points: total
        }
    );


    return total;
}
