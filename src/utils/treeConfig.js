import {
    getFromDb,
    setInDb
} from './database/wrapper.js';


function key(guildId, userId) {

    return `treeConfig:${guildId}:${userId}`;

}



export async function getTreeConfig(
    guildId,
    userId
) {

    return await getFromDb(

        key(guildId, userId),

        {

            background:
                '#ffffff',

            nodeColor:
                '#ffffff',

            borderColor:
                '#000000',

            lineColor:
                '#000000',

            lineStyle:
                'straight'

        }

    );

}



export async function saveTreeConfig(
    guildId,
    userId,
    config
) {

    await setInDb(

        key(guildId, userId),

        config

    );

}
