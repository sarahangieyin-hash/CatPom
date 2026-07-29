Perfecto. Ahora crea:

src/interactions/buttons/reject_marriage.js

Pega esto:

import {
    getFamilyRequest,
    rejectFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';


export default {

    customId: 'reject_marriage',


    async execute(interaction, client, args) {


        const id = args[0];


        const request =
            getFamilyRequest(id);



        if (!request) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud ya no existe.',

                ephemeral: true

            });

        }



        if (
            !request.members.includes(
                interaction.user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ No formas parte de esta unión.',

                ephemeral: true

            });

        }



        rejectFamilyRequest(
            id,
            interaction.user.id
        );


        deleteFamilyRequest(id);



        await interaction.update({

            content:

                `❌ <@${interaction.user.id}> ha rechazado la unión.`,

            embeds: [],

            components: []

        });


    }

};

Ahora ya tenemos el flujo básico:

/marry
   ↓
crea solicitud
   ↓
botones
   ↓
accept_marriage
   ↓
todos aceptan
   ↓
crea unión 💍

reject_marriage
   ↓
cancela

Siguiente haría una mejora importante antes de seguir con adopciones:

📄 src/utils/families.js

Hay que añadir una función para guardar y encontrar la unión correctamente, porque ahora mismo getFamilyByMember() busca en members, pero no está preparada para comprobar si alguien ya está casado antes de aceptar otra solicitud.

Vamos a arreglar eso antes de meter más relaciones.

.

Perfecto. Vamos a actualizar:

📄 src/utils/families.js

Sustituye el contenido entero por este:

import {
    getFromDb,
    setInDb,
    listFromDb,
    deleteFromDb
} from './database/wrapper.js';


function familyKey(guildId, id) {

    return `family:${guildId}:${id}`;

}



export async function createFamily(
    guildId,
    id,
    data
) {

    await setInDb(

        familyKey(guildId, id),

        {

            id,

            ...data,

            active: true,

            createdAt: Date.now()

        }

    );


    return data;

}



export async function getFamily(
    guildId,
    id
) {

    return await getFromDb(

        familyKey(guildId, id),

        null

    );

}



export async function updateFamily(
    guildId,
    id,
    data
) {

    await setInDb(

        familyKey(guildId, id),

        {

            ...data

        }

    );

}



export async function deleteFamily(
    guildId,
    id
) {

    await deleteFromDb(

        familyKey(guildId, id)

    );

}



export async function getAllFamilies(
    guildId
) {

    const families =
        await listFromDb(
            `family:${guildId}:`
        );


    return families.map(family => {


        if (family.value) {


            return {

                id:
                    family.key.split(':').pop(),

                ...family.value

            };


        }


        return family;


    });


}



export async function getFamilyByMember(
    guildId,
    userId
) {

    const families =
        await getAllFamilies(guildId);



    return families.find(
        family =>

            family.active !== false &&

            Array.isArray(
                family.members
            ) &&

            family.members.includes(
                userId
            )

    ) || null;


}



export async function isUserInFamily(
    guildId,
    userId
) {

    const family =
        await getFamilyByMember(
            guildId,
            userId
        );


    return Boolean(family);

}



export async function addMemberToFamily(
    guildId,
    familyId,
    userId
) {

    const family =
        await getFamily(
            guildId,
            familyId
        );


    if (!family)
        return false;



    if (!Array.isArray(family.members)) {

        family.members = [];

    }



    if (
        !family.members.includes(
            userId
        )
    ) {

        family.members.push(
            userId
        );

    }



    await updateFamily(

        guildId,

        familyId,

        family

    );


    return true;

}



export async function removeMemberFromFamily(
    guildId,
    familyId,
    userId
) {

    const family =
        await getFamily(
            guildId,
            familyId
        );


    if (!family)
        return false;



    family.members =
        family.members.filter(
            id =>
                id !== userId
        );



    await updateFamily(

        guildId,

        familyId,

        family

    );


    return true;

}

Cambios importantes:

✅ Guarda el id dentro de la familia.
✅ getFamilyByMember() ya detecta si alguien está en una unión.
✅ Añadí funciones para añadir/quitar miembros.
✅ Preparado para poliamor (varios members en una misma unión).

Ahora el siguiente paso sería hacer que marry.js compruebe si alguien ya está en una unión antes de crear la solicitud, para evitar que alguien casado vuelva a casarse sin permiso.

.

Perfecto. Ahora modificamos el comando de matrimonio para añadir esa protección.

Abre:

src/commands/Family/marry.js

Y sustitúyelo entero por este:

import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

import {
    createFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    isUserInFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('marry')

        .setDescription('Solicita una unión matrimonial.')

        .addUserOption(option =>
            option
                .setName('persona1')
                .setDescription('Primera persona')
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('persona2')
                .setDescription('Segunda persona')
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName('persona3')
                .setDescription('Tercera persona')
                .setRequired(false)
        ),


    async execute(interaction) {


        const personas = [

            interaction.options.getUser('persona1'),

            interaction.options.getUser('persona2'),

            interaction.options.getUser('persona3')

        ]
        .filter(Boolean);



        const miembros = [

            interaction.user,

            ...personas

        ];



        const ids =
            miembros.map(
                user => user.id
            );



        if (
            new Set(ids).size !== ids.length
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes añadir a la misma persona varias veces.',

                ephemeral: true

            });

        }



        for (
            const user of miembros
        ) {


            const exists =
                await isUserInFamily(

                    interaction.guild.id,

                    user.id

                );



            if (exists) {

                return interaction.reply({

                    content:
                        `❌ ${user} ya pertenece a una unión.`,

                    ephemeral: true

                });

            }

        }



        const request =

            createFamilyRequest(

                'marriage',

                {

                    members: ids,

                    creator:
                        interaction.user.id

                }

            );



        const embed =

            new EmbedBuilder()

                .setTitle(
                    '💍 Nueva solicitud de unión'
                )

                .setDescription(

                    `${interaction.user} quiere formar una unión con:\n\n` +

                    personas
                        .map(
                            user =>
                                `💍 ${user}`
                        )
                        .join('\n')

                )

                .setFooter({

                    text:
                        `Solicitud: ${request.id}`

                });



        const buttons =

            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `accept_marriage:${request.id}`
                        )

                        .setLabel(
                            'Aceptar'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `reject_marriage:${request.id}`
                        )

                        .setLabel(
                            'Rechazar'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );



        await interaction.reply({

            embeds: [
                embed
            ],

            components: [
                buttons
            ]

        });


    }

};

Ahora el sistema ya tiene esta regla:

✅ Angie puede crear:

Angie + Sarah + Alexia

si ninguna está casada.

❌ Angie no puede crear:

Angie + otra persona

si ya tiene una unión.

Siguiente haría una cosa importante: arreglar el sistema de solicitudes, porque ahora mismo se guarda en memoria y al reiniciar el bot se pierde.

Crearíamos:

src/family/requests/familyRequests.js

usando tu wrapper.js, igual que las misiones.


