import { SlashCommandBuilder } from 'discord.js';


const answers = [
    "Sí, definitivamente.",
    "Sin duda alguna.",
    "Las señales apuntan a que sí.",
    "Parece que será así.",
    "Probablemente.",
    "Todo indica que sí.",

    "No lo creo.",
    "Las probabilidades no están a tu favor.",
    "Mi respuesta es no.",
    "No parece buena idea.",
    "Definitivamente no.",

    "No puedo saberlo ahora.",
    "Pregunta más tarde.",
    "Mejor no decirlo todavía.",
    "El destino está indeciso.",
    "Hay demasiadas variables.",
    
    "Pomp dice que sí, pero no confíes demasiado.",
    "Pomp ha consultado los registros y sigue confundido.",
    "El consejo de Metztlan no tiene una respuesta.",
    "Los aldeanos tampoco lo saben.",
    "La respuesta está escondida en una cueva demasiado profunda.",
    "Pomp ha tirado una moneda y ha decidido improvisar.",
];


export default {

    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Pregunta algo a la bola mágica')
        .addStringOption(option =>
            option
                .setName('pregunta')
                .setDescription('La pregunta que quieres hacer')
                .setRequired(true)
        ),


    async execute(interaction) {

        const question = interaction.options.getString('pregunta');


        const answer = answers[
            Math.floor(Math.random() * answers.length)
        ];


        await interaction.reply(
            `🎱 **Pregunta:** ${question}\n\n${answer}`
        );

    }

};
