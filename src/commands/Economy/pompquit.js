import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { removePomp } from '../../utils/points.js';


export default {

    data: new SlashCommandBuilder()
        .setName('pompquit')
        .setDescription('Quitar Pomp a un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario al que quitar Pomp')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('cantidad')
                .setDescription('Cantidad de Pomp')
                .setRequired(true)
        ),


    async execute(interaction) {

        if (!interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        )) {
            return interaction.reply({
                content:'❌ No tienes permisos.',
                ephemeral:true
            });
        }


        const user =
            interaction.options.getUser('usuario');


        const amount =
            interaction.options.getInteger('cantidad');


        const total = await removePomp(
            interaction.guild.id,
            user.id,
            amount
        );


        return interaction.reply(
            `✅ Se quitaron **${amount} Pomp** a ${user}.\n💎 Ahora tiene **${total} Pomp**.`
        );

    }
};
