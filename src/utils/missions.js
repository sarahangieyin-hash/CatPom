import { getFromDb, setInDb, listFromDb, deleteFromDb } from './database/wrapper.js';

function missionKey(guildId, id) {
    return `mission:${guildId}:${id}`;
}

export async function createMission(guildId, id, data) {
    await setInDb(
        missionKey(guildId, id),
        {
            ...data,
            active: true
        }
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

export async function deleteMission(guildId, id) {
    await deleteFromDb(
        missionKey(guildId, id)
    );
}

export async function getAllMissions(guildId) {
    return await listFromDb(
        `mission:${guildId}:`
    );
}
