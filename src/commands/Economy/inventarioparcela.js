import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const invPath = path.resolve('src/data/inventario_parcelas.json');

export default {
    data: new SlashCommandBuilder()
        .setName('inventarioparcela')
        .setDescription('Consulta los derechos de parcelas disponibles en tu inventario (o el de otro usuario)')
        .addUserOption(o => 
            o.setName('usuario')
             .setDescription('Usuario a consultar (opcional)')
             .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const guildId = interaction.guild.id;

        let inventario = {};
        if (fs.existsSync(invPath)) {
            try { inventario = JSON.parse(fs.readFileSync(invPath, 'utf8')); } catch (e) {}
        }

        const userInv = inventario[guildId]?.[targetUser.id] || { A: 0, B: 0, C: 0 };

        const embed = new EmbedBuilder()
            .setTitle(`📦 Inventario de Derechos de Parcela`)
            .setDescription(`Titular: <@${targetUser.id}>`)
            .addFields(
                { name: '🏰 Parcela Tipo A', value: `**${userInv.A}** disponibles`, inline: true },
                { name: '🏡 Parcela Tipo B', value: `**${userInv.B}** disponibles`, inline: true },
                { name: '🏠 Parcela Tipo C', value: `**${userInv.C}** disponibles`, inline: true }
            )
            .setColor('#3498DB')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
