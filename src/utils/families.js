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



export default {


    data: new SlashCommandBuilder()

        .setName('marry')

        .setDescription('Solicita un matrimonio o unión.')

        .addUserOption(option =>
            option
                .setName('persona1')
                .setDescription('Primera persona')
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('persona2')
                .setDescription('Segunda persona (opcional)')
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName('persona3')
                .setDescription('Tercera persona (opcional)')
                .setRequired(false)
        ),



    async execute(interaction) {



        const personas = [

            interaction.options.getUser('persona1'),

            interaction.options.getUser('persona2'),

            interaction.options.getUser('persona3')

        ]

        .filter(Boolean);



        const members = [

            interaction.user,

            ...personas

        ];



        const ids =

            members.map(

                user =>
                    user.id

            );



        if (
            new Set(ids).size !== ids.length
        ) {


            return interaction.reply({

                content:
                    '❌ No puedes repetir personas.',

                ephemeral:
                    true

            });

        }



        const requestId =

            `marriage_${Date.now()}`;



        await createFamilyRequest(

            interaction.guild.id,

            requestId,

            {

                type:
                    'marriage',


                members:
                    ids,


                creator:
                    interaction.user.id,


                accepted:
                    [

                        interaction.user.id

                    ]

            }

        );



        const embed =

            new EmbedBuilder()

                .setTitle(
                    '💍 Solicitud de unión'
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

                .setColor(
                    0xffc0cb
                );



        const buttons =

            new ActionRowBuilder()

                .addComponents(


                    new ButtonBuilder()

                        .setCustomId(

                            `accept_marriage:${requestId}`

                        )

                        .setLabel(
                            'Aceptar'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),



                    new ButtonBuilder()

                        .setCustomId(

                            `reject_marriage:${requestId}`

                        )

                        .setLabel(
                            'Rechazar'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )


                );



        await interaction.reply({

            embeds:
                [
                    embed
                ],

            components:
                [
                    buttons
                ]

        });


    }

};import {
    getFromDb,
    setInDb
} from './database.js';



function familyKey(
    guildId,
    familyId
) {

    return `family:${guildId}:${familyId}`;

}



function memberFamilyKey(
    guildId,
    userId
) {

    return `familyMember:${guildId}:${userId}`;

}




export async function createFamily(
    guildId,
    members = []
) {


    const id =
        Date.now().toString();



    const family = {

        id,


        members,


        children: [],


        parents: [],


        siblings: [],


        lovers: [],


        createdAt:
            Date.now()

    };



    await setInDb(

        familyKey(
            guildId,
            id
        ),

        family

    );



    for (
        const member of members
    ) {


        await setInDb(

            memberFamilyKey(
                guildId,
                member
            ),

            id

        );


    }



    return family;

}





export async function getFamilyByMember(
    guildId,
    userId
) {


    const familyId =

        await getFromDb(

            memberFamilyKey(
                guildId,
                userId
            )

        );



    if (!familyId)
        return null;



    return await getFromDb(

        familyKey(
            guildId,
            familyId
        )

    );

}





export async function updateFamily(
    guildId,
    familyId,
    family
) {


    await setInDb(

        familyKey(
            guildId,
            familyId
        ),

        family

    );



    return family;

}
