import { getFromDb, setInDb, listFromDb } from './database/wrapper.js';

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

export async function getAllMissions(guildId) {

    return await listFromDb(
        `mission:${guildId}:`
    );

}
export async function listFromDb(prefix) {
    try {
        return await db.list(prefix);
    } catch (error) {
        logger.error(`Error listing keys with prefix ${prefix}:`, error);
        return [];
    }
}