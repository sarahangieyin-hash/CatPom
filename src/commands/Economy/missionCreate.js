import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createMission } from '../../utils/missions.js';


export default {

data: new SlashCommandBuilder()
.setName('mision')
.setDescription('Crear una misión')
.addStringOption(o =>
    o.setName('nombre')
    .setDescription('Nombre de la misión')
    .setRequired(true)
)
.addIntegerOption(o =>
    o.setName('personas')
    .setDescription('Personas necesarias')
    .setRequired(true)
)
.addIntegerOption(o =>
    o.setName('puntos')
    .setDescription('Pomp de recompensa')
    .setRequired(true)
),


async execute(interaction){

    const nombre = interaction.options.getString('nombre');
    const personas = interaction.options.getInteger('personas');
    const puntos = interaction.options.getInteger('puntos');


    const id = Date.now().toString();


    await createMission(
        interaction.guild.id,
        id,
        {
            nombre,
            personas,
            puntos,
            usuarios:[]
        }
    );


    const embed = new EmbedBuilder()
    .setTitle(`🏗️ ${nombre}`)
    .setDescription(
        `👥 Participantes: 0/${personas}\n\n💎 Recompensa: ${puntos} Pomp`
    );


    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId(`join_mission_${id}`)
        .setLabel('Unirse')
        .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
        .setCustomId(`finish_mission_${id}`)
        .setLabel('Terminar')
        .setStyle(ButtonStyle.Danger)
    );


    await interaction.reply({
        embeds:[embed],
        components:[row]
    });

}

};
