import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { addPomp } from '../../utils/points.js';


export default {

    data: new SlashCommandBuilder()
        .setName('pompadd')
        .setDescription('Añadir Pomp a un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario que recibirá Pomp')
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
                content: '❌ No tienes permisos para usar este comando.',
                ephemeral: true
            });
        }


        const user = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');


        const total = await addPomp(
            interaction.guild.id,
            user.id,
            amount
        );


        return interaction.reply(
            `✅ ${user} recibió **${amount} Pomp**.\n💎 Ahora tiene **${total} Pomp**.`
        );
    }
};
export async function addPomp(guildId, userId, amount) {

    const current = await getPomp(guildId, userId);

    console.log("PUNTOS ANTES:", current);

    const total = current + amount;

    console.log("GUARDANDO:", {
        key: getPointsKey(guildId, userId),
        value: { points: total }
    });

    await setInDb(
        getPointsKey(guildId, userId),
        {
            points: total
        }
    );

    return total;
}
