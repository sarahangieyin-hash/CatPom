import { getFromDb, setInDb } from './database.js';


function getPointsKey(guildId, userId) {
    return `pomp:${guildId}:${userId}`;
}



export async function getPomp(guildId, userId) {

    const data = await getFromDb(
        getPointsKey(guildId, userId),
        {
            points: 0
        }
    );


    return Number(data?.points || 0);
}



export async function addPomp(guildId, userId, amount) {

    const current = await getPomp(
        guildId,
        userId
    );


    const total = current + amount;


    await setInDb(
        getPointsKey(guildId, userId),
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
        getPointsKey(guildId, userId),
        {
            points: total
        }
    );


    return total;
}



export async function getPoints(guildId, userId) {
    return getPomp(guildId, userId);
}



export async function removePoints(guildId, userId, amount) {
    return removePomp(guildId, userId, amount);
}



export async function addPoints(guildId, userId, amount) {
    return addPomp(guildId, userId, amount);
}
