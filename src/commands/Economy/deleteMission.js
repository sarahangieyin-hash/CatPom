import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllMissions, deleteMission } from '../../utils/missions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('eliminar-mision')
        .setDescription('Elimina una misión activa del servidor')
        .addStringOption(o =>
            o.setName('nombre')
                .setDescription('El nombre actual o parte del nombre de la misión a eliminar')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const nombreBusqueda = interaction.options.getString('nombre').toLowerCase();

        try {
            const missions = await getAllMissions(interaction.guild.id);
            const missionEntry = missions.find(m => m.nombre && m.nombre.toLowerCase().includes(nombreBusqueda));

            if (!missionEntry || !missionEntry.id) {
                return interaction.editReply(`❌ No se encontró ninguna misión activa que coincida con "**${nombreBusqueda}**".`);
            }

            // Eliminamos la misión de la base de datos usando tu wrapper
            await deleteMission(interaction.guild.id, missionEntry.id);

            // Si la misión tenía un rol asociado, intentamos eliminarlo también del servidor
            if (missionEntry.roleId) {
                const role = interaction.guild.roles.cache.get(missionEntry.roleId);
                if (role) {
                    await role.delete('Misión eliminada').catch(() => {});
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Misión Eliminada Correctamente')
                .setColor('#FF0000')
                .setDescription(
                    `Se ha borrado la misión con éxito:\n\n` +
                    `📌 **Nombre:** ${missionEntry.nombre}\n` +
                    `👥 **Personas necesarias:** ${missionEntry.personas}\n` +
                    `💎 **Recompensa:** ${missionEntry.puntos} Pomp`
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al eliminar la misión:', error);
            await interaction.editReply('❌ Hubo un error al intentar eliminar la misión.');
        }
    }
};
