import { getFromDb, setInDb } from './database/wrapper.js';

function getMissionKey(guildId, id) {
    return `mission:${guildId}:${id}`;
}


export async function createMission(guildId, id, data) {
    await setInDb(
        getMissionKey(guildId, id),
        data
    );

    return data;
}


export async function getMission(guildId, id) {
    return await getFromDb(
        getMissionKey(guildId, id),
        null
    );
}


export async function updateMission(guildId, id, data) {
    await setInDb(
        getMissionKey(guildId, id),
        data
    );

    return data;
}
