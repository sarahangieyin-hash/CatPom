import {
    request
} from 'undici';


export async function loadAvatar(
    user
) {

    try {

        const response =
            await request(
                user.displayAvatarURL({
                    extension: 'png',
                    size: 256
                })
            );


        const buffer =
            await response.body.arrayBuffer();


        return Buffer.from(
            buffer
        );


    } catch (error) {

        return null;

    }

}
