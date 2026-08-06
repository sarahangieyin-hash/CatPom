import { MessageFlags } from 'discord.js';

export default {
    customId: 'poll',

    async execute(interaction, client, args) {
        const roleId = args[0];
        const optionIndex = args[1];

        if (!interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({
                content: `❌ Solo los miembros con el rol <@&${roleId}> pueden votar en esta encuesta.`,
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: `✅ ¡Tu voto para la opción ${parseInt(optionIndex) + 1} ha sido registrado!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
