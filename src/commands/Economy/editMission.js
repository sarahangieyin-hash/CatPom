import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import pool from '../../database/db.js'; // Ajusta la ruta a tu conexión de Postgres si es distinta

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

        const nombreActual = interaction.options.getString('nombre_actual');
        const nuevoNombre = interaction.options.getString('nuevo_nombre');
        const nuevasPersonas = interaction.options.getInteger('nuevas_personas');
        const nuevosPuntos = interaction.options.getInteger('nuevos_puntos');

        if (!nuevoNombre && nuevasPersonas === null && nuevosPuntos === null) {
            return interaction.editReply('❌ Debes proporcionar al menos un campo para modificar (nombre, personas o puntos).');
        }

        try {
            // Buscamos la misión en PostgreSQL por guild_id y nombre parecido
            const querySelect = `SELECT * FROM missions WHERE guild_id = $1 AND nombre ILIKE $2`;
            const result = await pool.query(querySelect, [interaction.guild.id, `%${nombreActual}%`]);

            if (result.rows.length === 0) {
                return interaction.editReply(`❌ No se encontró ninguna misión que coincida con "**${nombreActual}**".`);
            }

            const mission = result.rows[0];

            // Definimos los nuevos valores o mantenemos los actuales
            const updatedNombre = nuevoNombre || mission.nombre;
            const updatedPersonas = nuevasPersonas !== null ? nuevasPersonas : mission.personas;
            const updatedPuntos = nuevosPuntos !== null ? nuevosPuntos : mission.puntos;

            // Actualizamos en la base de datos PostgreSQL
            const queryUpdate = `
                UPDATE missions 
                SET nombre = $1, personas = $2, puntos = $3 
                WHERE id = $4 AND guild_id = $5 
                RETURNING *;
            `;
            await pool.query(queryUpdate, [updatedNombre, updatedPersonas, updatedPuntos, mission.id, interaction.guild.id]);

            // Si se cambió el nombre y la misión tenía un rol asociado, intentamos actualizarlo
            if (nuevoNombre && mission.roleId) {
                const role = interaction.guild.roles.cache.get(mission.roleId);
                if (role) {
                    await role.setName(nuevoNombre).catch(() => {});
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Misión Actualizada Correctamente')
                .setColor('#00FF00')
                .setDescription(
                    `Se han modificado los datos de la misión:\n\n` +
                    `📌 **Nombre:** ${mission.nombre} ➡️ **${updatedNombre}**\n` +
                    `👥 **Personas:** ${mission.personas} ➡️ **${updatedPersonas}**\n` +
                    `💎 **Puntos (Pomp):** ${mission.puntos} ➡️ **${updatedPuntos}**`
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al editar la misión:', error);
            await interaction.editReply('❌ Hubo un error al intentar actualizar la misión en la base de datos.');
        }
    }
};
