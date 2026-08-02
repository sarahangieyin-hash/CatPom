const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Mission = require('../../models/Mission'); // Ajusta la ruta a tu modelo de Misiones

module.exports = {
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

        // Verificar si se proporcionó al menos un cambio
        if (!newTitle && !newDescription && !newReward) {
            return interaction.editReply('❌ Debes proporcionar al menos un campo para actualizar (título, descripción o recompensa).');
        }

        try {
            // Buscamos la misión por ID o por Título (según cómo guardes tus misiones)
            let mission = await Mission.findOne({
                $or: [
                    { _id: missionIdentifier.match(/^[0-9a-fA-F]{24}$/) ? missionIdentifier : null },
                    { title: { $regex: new RegExp(`^${missionIdentifier}$`, 'i') } }
                ].filter(condition => condition._id !== null || condition.title)
            });

            if (!mission) {
                return interaction.editReply(`❌ No se ha encontrado ninguna misión con el identificador: **${missionIdentifier}**`);
            }

            // Actualizamos solo los campos que el usuario haya rellenado
            if (newTitle) mission.title = newTitle;
            if (newDescription) mission.description = newDescription;
            if (newReward !== null) mission.reward = newReward;

            await mission.save();

            const embed = new EmbedBuilder()
                .setTitle('✅ Misión Actualizada con Éxito')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Título', value: mission.title, inline: true },
                    { name: 'Recompensa', value: `${mission.reward} 🪙`, inline: true },
                    { name: 'Descripción', value: mission.description || 'Sin descripción' }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al editar la misión:', error);
            await interaction.editReply('❌ Ocurrió un error al intentar actualizar la misión en la base de datos.');
        }
    },
};
