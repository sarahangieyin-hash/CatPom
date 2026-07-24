import { getEconomyKey } from './database.js';
import { getFromDb, setInDb } from './database.js';



function getPointsKey(guildId, userId){

    return `pomp:${guildId}:${userId}`;

}



// Obtener puntos

export async function getPomp(guildId, userId){

    const key = getPointsKey(
        guildId,
        userId
    );


    const data = await getFromDb(
        key,
        {
            points:0
        }
    );


    return Number(data.points || 0);

}




// Añadir puntos

export async function addPomp(
    guildId,
    userId,
    amount
){

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




// Quitar puntos

export async function removePomp(
    guildId,
    userId,
    amount
){


    const current = await getPomp(
        guildId,
        userId
    );


    let total =
        current - amount;



    if(total < 0)
        total = 0;



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
export async function getPoints(guildId, userId) {
    const key = getPointsKey(guildId, userId);

    const points = await getFromDb(key, 0);

    return Number(points || 0);
}


export async function addPoints(guildId, userId, amount) {

    const current = await getPoints(guildId, userId);

    const total = current + amount;

    await setInDb(
        getPointsKey(guildId, userId),
        total
    );

    return total;
}


export async function removePoints(guildId, userId, amount) {

    const current = await getPoints(guildId, userId);

    const total = Math.max(
        0,
        current - amount
    );

    await setInDb(
        getPointsKey(guildId, userId),
        total
    );

    return total;
}


// Alias usados por los comandos Pomp
export async function getPomp(guildId, userId) {
    return getPoints(guildId, userId);
}


export async function addPomp(guildId, userId, amount) {
    return addPoints(guildId, userId, amount);
}


export async function removePomp(guildId, userId, amount) {
    return removePoints(guildId, userId, amount);
}
