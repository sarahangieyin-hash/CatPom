import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllMissions, updateMission } from '../../utils/missions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('editar-mision')
        .setDescription('Edita una misión existente sin necesidad de crear una nueva')
        .addStringOption(o =>
            o.setName('nombre_actual')
                .setDescription('El nombre actual o parte del nombre de la misión')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('nuevo_nombre')
                .setDescription('Nuevo nombre para la misión (opcional)')
                .setRequired(false)
        )
        .addIntegerOption(o =>
            o.setName('nuevas_personas')
                .setDescription('Nuevas personas necesarias (opcional)')
                .setRequired(false)
        )
        .addIntegerOption(o =>
            o.setName('nuevos_puntos')
                .setDescription('Nuevos Pomp de recompensa (opcional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const nombreActual = interaction.options.getString('nombre_actual').toLowerCase();
        const nuevoNombre = interaction.options.getString('nuevo_nombre');
        const nuevasPersonas = interaction.options.getInteger('nuevas_personas');
        const nuevosPuntos = interaction.options.getInteger('nuevos_puntos');

        if (!nuevoNombre && nuevasPersonas === null && nuevosPuntos === null) {
            return interaction.editReply('❌ Debes proporcionar al menos un campo para modificar (nombre, personas o puntos).');
        }

        try {
            // Obtenemos todas las misiones del servidor usando tu wrapper
            const missions = await getAllMissions(interaction.guild.id);
            
            // Buscamos la misión que coincida con el nombre
            const missionEntry = missions.find(m => m.nombre && m.nombre.toLowerCase().includes(nombreActual));

            if (!missionEntry || !missionEntry.id) {
                return interaction.editReply(`❌ No se encontró ninguna misión activa que coincida con "**${nombreActual}**".`);
            }

            // Preparamos los datos actualizados manteniendo los anteriores si no se cambian
            const updatedData = {
                ...missionEntry,
                nombre: nuevoNombre || missionEntry.nombre,
                personas: nuevasPersonas !== null ? nuevasPersonas : missionEntry.personas,
                puntos: nuevosPuntos !== null ? nuevosPuntos : missionEntry.puntos
            };

            // Guardamos los cambios con tu función oficial de misiones
            await updateMission(interaction.guild.id, missionEntry.id, updatedData);

            // Si cambió el nombre y tenía un rol asociado, actualizamos el nombre del rol también
            if (nuevoNombre && missionEntry.roleId) {
                const role = interaction.guild.roles.cache.get(missionEntry.roleId);
                if (role) {
                    await role.setName(nuevoNombre).catch(() => {});
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Misión Actualizada Correctamente')
                .setColor('#00FF00')
                .setDescription(
                    `Se han modificado los datos de la misión:\n\n` +
                    `📌 **Nombre:** ${missionEntry.nombre} ➡️ **${updatedData.nombre}**\n` +
                    `👥 **Personas:** ${missionEntry.personas} ➡️ **${updatedData.personas}**\n` +
                    `💎 **Puntos (Pomp):** ${missionEntry.puntos} ➡️ **${updatedData.puntos}**`
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al editar la misión:', error);
            await interaction.editReply('❌ Hubo un error al intentar actualizar la misión.');
        }
    }
};
