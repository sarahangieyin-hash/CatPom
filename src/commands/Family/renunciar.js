import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('renunciar')

        .setDescription('Renuncia a uno de tus hijos.'),


    async execute(interaction) {


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );


        if (!family) {

            return interaction.reply({

                content:
                    '❌ No perteneces a ninguna familia.',

                ephemeral: true

            });

        }


        const children =
            Array.isArray(family.children)

                ? family.children.filter(

                    child =>
                        child.parent === interaction.user.id

                )

                : [];


        if (!children.length) {

            return interaction.reply({

                content:
                    '❌ No tienes hijos adoptados.',

                ephemeral: true

            });

        }


        const options = [];


        for (const child of children) {

            const member =
                await interaction.guild.members
                    .fetch(child.id)
                    .catch(() => null);


            options.push({

                label:
                    member?.displayName ??
                    child.id,

                value:
                    child.id

            });

        }



        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    'renunciar_child'
                )

                .setPlaceholder(
                    'Selecciona un hijo/a'
                )

                .addOptions(
                    options
                );



        const row =
            new ActionRowBuilder()

                .addComponents(
                    menu
                );



        await interaction.reply({

            content:
                '👶 Selecciona al hijo/a del que quieres renunciar:',

            components: [
                row
            ],

            ephemeral: true

        });

    }

};
