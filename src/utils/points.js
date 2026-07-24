import { getFromDb, setInDb } from './database.js';


function getPointsKey(guildId, userId) {

    return `pomp:${guildId}:${userId}`;

}



// Ver puntos de un usuario

export async function getPomp(guildId, userId) {

    const key = getPointsKey(
        guildId,
        userId
    );


    const data = await getFromDb(
        key,
        {
            points: 0
        }
    );


    return Number(data.points || 0);

}



// Añadir Pomp

export async function addPomp(
    guildId,
    userId,
    amount
) {

    const current = await getPomp(
        guildId,
        userId
    );


    const total =
        current + amount;



    await setInDb(
        getPointsKey(
            guildId,
            userId
        ),
        {
            points: total
        }
    );


    return total;

}



// Quitar Pomp

export async function removePomp(
    guildId,
    userId,
    amount
) {

    const current = await getPomp(
        guildId,
        userId
    );


    const total = Math.max(
        0,
        current - amount
    );



    await setInDb(
        getPointsKey(
            guildId,
            userId
        ),
        {
            points: total
        }
    );


    return total;

}



// Alias para botones de parcelas

export async function getPoints(
    guildId,
    userId
) {

    return getPomp(
        guildId,
        userId
    );

}



export async function removePoints(
    guildId,
    userId,
    amount
) {

    return removePomp(
        guildId,
        userId,
        amount
    );

}
