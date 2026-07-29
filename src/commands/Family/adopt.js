import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

export default {

    data: new SlashCommandBuilder()

        .setName('adopt')

        .setDescription('Solicita adoptar a una persona.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona que quieres adoptar')
                .setRequired(true)
        ),

    async execute(interaction) {

        const child =
            interaction.options.getUser('persona');

        if (child.id === interaction.user.id) {

            return interaction.reply({

                content: '❌ No puedes adoptarte a ti mismo.',

                ephemeral: true

            });

        }

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `accept_adoption_${interaction.user.id}_${child.id}`
                        )
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(
                            `reject_adoption_${interaction.user.id}_${child.id}`
                        )
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)

                );

        await interaction.reply({

            content:
                `👶 ${interaction.user} quiere adoptarte.\n\n${child}, ¿aceptas?`,

            components: [row]

        });

    }

};
