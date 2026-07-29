import {
    getFromDb,
    setInDb,
    deleteFromDb,
    listFromDb
} from '../../utils/database/wrapper.js';


function requestKey(guildId, id) {

    return `family_request:${guildId}:${id}`;

}



export async function createFamilyRequest(
    guildId,
    id,
    data
) {

    const request = {

        id,

        ...data,

        accepted:
            data.accepted || [],

        rejected:
            data.rejected || [],

        createdAt:
            Date.now()

    };


    await setInDb(

        requestKey(
            guildId,
            id
        ),

        request

    );


    return request;

}



export async function getFamilyRequest(
    guildId,
    id
) {

    return await getFromDb(

        requestKey(
            guildId,
            id
        ),

        null

    );

}



export async function acceptFamilyRequest(
    guildId,
    id,
    userId
) {

    const request =
        await getFamilyRequest(
            guildId,
            id
        );


    if (!request)
        return null;



    if (
        !request.accepted.includes(
            userId
        )
    ) {

        request.accepted.push(
            userId
        );

    }



    request.rejected =
        request.rejected.filter(

            id =>
                id !== userId

        );



    await setInDb(

        requestKey(
            guildId,
            id
        ),

        request

    );


    return request;

}



export async function rejectFamilyRequest(
    guildId,
    id,
    userId
) {

    const request =
        await getFamilyRequest(
            guildId,
            id
        );


    if (!request)
        return null;



    if (
        !request.rejected.includes(
            userId
        )
    ) {

        request.rejected.push(
            userId
        );

    }



    await setInDb(

        requestKey(
            guildId,
            id
        ),

        request

    );


    return request;

}



export async function deleteFamilyRequest(
    guildId,
    id
) {

    await deleteFromDb(

        requestKey(
            guildId,
            id
        )

    );

}



export async function getAllFamilyRequests(
    guildId
) {

    const requests =
        await listFromDb(
            `family_request:${guildId}:`
        );


    return requests.map(

        request => {


            if (request.value) {

                return {

                    id:
                        request.key.split(':').pop(),

                    ...request.value

                };

            }


            return request;

        }

    );

}
