import { getFromDb, setInDb } from './database/wrapper.js';


function missionKey(guildId, id) {
    return `mission:${guildId}:${id}`;
}


export async function createMission(guildId, id, data) {

    await setInDb(
        missionKey(guildId, id),
        data
    );

    return data;
}


export async function getMission(guildId, id) {

    return await getFromDb(
        missionKey(guildId, id),
        null
    );

}


export async function updateMission(guildId, id, data) {

    await setInDb(
        missionKey(guildId, id),
        data
    );

}
