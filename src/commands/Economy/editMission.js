import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import pool from '../../database/db.js'; // Ajusta la ruta a tu conexión de PostgreSQL si es distinta

export default {
    data: new SlashCommandBuilder()
        .setName('edit-mission')
        .setDescription('Edita una misión de economía existente sin crear una nueva.')
        .addStringOption(option =>
            option.setName('mission_id')
                .setDescription('El ID o título exacto de la misión que quieres editar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('new_title')
                .setDescription('Nuevo título para la misión')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('new_description')
                .setDescription('Nueva descripción de la misión')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('new_reward')
                .setDescription('Nueva recompensa de monedas')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const missionIdentifier = interaction.options.getString('mission_id');
        const newTitle = interaction.options.getString('new_title');
        const newDescription = interaction.options.getString('new_description');
        const newReward = interaction.options.getInteger('new_reward');

        if (!newTitle && !newDescription && newReward === null) {
            return interaction.editReply('❌ Debes proporcionar al menos un campo para actualizar (título, descripción o recompensa).');
        }

        try {
            // Buscamos la misión en PostgreSQL por ID (si es numérico o UUID) o por título
            let query = `SELECT * FROM missions WHERE id::text = $1 OR title ILIKE $2`;
            let result = await pool.query(query, [missionIdentifier, missionIdentifier]);

            if (result.rows.length === 0) {
                return interaction.editReply(`❌ No se ha encontrado ninguna misión con el identificador: **${missionIdentifier}**`);
            }

            let mission = result.rows[0];

            // Preparamos los valores actualizados conservando los anteriores si no se modifican
            const updatedTitle = newTitle || mission.title;
            const updatedDescription = newDescription || mission.description;
            const updatedReward = newReward !== null ? newReward : mission.reward;

            // Actualizamos en la base de datos
            const updateQuery = `
                UPDATE missions 
                SET title = $1, description = $2, reward = $3 
                WHERE id = $4 
                RETURNING *;
            `;
            const updateResult = await pool.query(updateQuery, [updatedTitle, updatedDescription, updatedReward, mission.id]);
            const updatedMission = updateResult.rows[0];

            const embed = new EmbedBuilder()
                .setTitle('✅ Misión Actualizada con Éxito')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Título', value: updatedMission.title, inline: true },
                    { name: 'Recompensa', value: `${updatedMission.reward} 🪙`, inline: true },
                    { name: 'Descripción', value: updatedMission.description || 'Sin descripción' }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al editar la misión:', error);
            await interaction.editReply('❌ Ocurrió un error al intentar actualizar la misión en la base de datos.');
        }
    },
};
