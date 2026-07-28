import {
    SlashCommandBuilder,
    PermissionFlagsBits
} from 'discord.js';

import {
    getAllMissions,
    updateMission
} from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('pomrepair')
        .setDescription('Repara las misiones antiguas creando sus roles.')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        await interaction.deferReply({
            ephemeral: true
        });

        const missions = await getAllMissions(
            interaction.guild.id
        );

        let repaired = 0;
        let skipped = 0;

        for (const mission of missions) {

            if (!mission.active) {
                continue;
            }

            if (mission.roleId) {
                skipped++;
                continue;
            }

            const role = await interaction.guild.roles.create({
                name: mission.nombre,
                mentionable: true,
                reason: 'Reparación de misión antigua'
            });

            mission.roleId = role.id;

            await updateMission(
                interaction.guild.id,
                mission.id,
                mission
            );

            repaired++;

        }

        await interaction.editReply(
            `✅ Reparación completada.\n\n` +
            `🛠️ Roles creados: **${repaired}**\n` +
            `✔️ Ya tenían rol: **${skipped}**`
        );

    }

};
