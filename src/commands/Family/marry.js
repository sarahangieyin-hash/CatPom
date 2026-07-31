import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} from 'discord.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('Propón matrimonio a alguien o pide a tu pareja actual ampliar la unión múltiple.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('La persona a la que quieres proponer matrimonio')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const author = interaction.user;
            const target = interaction.options.getUser('usuario');

            if (author.id === target.id) {
                return interaction.reply({ content: '❌ No puedes casarte contigo mismo.', flags: MessageFlags.Ephemeral });
            }

            const family = await getUserFamilyData(interaction.guild.id, author.id);
            const spouses = family.spouses || [];

            // CASO 1: Ya está casado con la persona a la que intenta proponerle matrimonio de nuevo
            if (spouses.includes(target.id)) {
                return interaction.reply({ content: `❌ Ya estás casado/a con <@${target.id}>.`, flags: MessageFlags.Ephemeral });
            }

            // CASO 2: EL USUARIO YA ESTÁ CASADO (Quiere ampliar el grupo / matrimonio múltiple)
            if (spouses.length > 0) {
                // Tomamos al cónyuge actual para pedirle permiso
                const currentSpouseId = spouses[0]; 
                const currentSpouse = await interaction.guild.members.fetch(currentSpouseId).catch(() => null);

                if (!currentSpouse) {
                    return interaction.reply({ content: '❌ No se pudo encontrar a tu pareja actual para pedirle autorización.', flags: MessageFlags.Ephemeral });
                }

                // Usamos dos puntos (:) para que tu interactionCreate extraiga los argumentos correctamente
                const acceptBtn = new ButtonBuilder()
                    .setCustomId(`expand_marriage_accept:${author.id}:${target.id}`)
                    .setLabel('Aceptar Ampliación')
                    .setStyle(ButtonStyle.Success);

                const rejectBtn = new ButtonBuilder()
                    .setCustomId(`expand_marriage_reject:${author.id}:${target.id}`)
                    .setLabel('Rechazar')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(acceptBtn, rejectBtn);

                await interaction.reply({
                    content: `💍 <@${author.id}> ya forma parte de un matrimonio, pero quiere proponerle matrimonio a <@${target.id}> para ampliar la unión.\n¿Autorizas que se añada a la unión?`,
                    components: [row]
                });
                return;
            }

            // CASO 3: SOLTERO (Matrimonio tradicional de 2 personas)
            const targetFamily = await getUserFamilyData(interaction.guild.id, target.id);
            if (targetFamily.spouses && targetFamily.spouses.length > 0) {
                return interaction.reply({ content: `❌ <@${target.id}> ya está casado/a con otra persona o grupo.`, flags: MessageFlags.Ephemeral });
            }

            const acceptBtn = new ButtonBuilder()
                .setCustomId(`accept_marriage:${author.id}:${target.id}`)
                .setLabel('Aceptar')
                .setStyle(ButtonStyle.Success);

            const rejectBtn = new ButtonBuilder()
                .setCustomId(`deny_marriage:${author.id}:${target.id}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(acceptBtn, rejectBtn);

            await interaction.reply({
                content: `💍 <@${target.id}>, <@${author.id}> te ha pedido matrimonio. ¿Aceptas?`,
                components: [row]
            });

        } catch (error) {
            console.error("ERROR EN MARRY:", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "❌ Ocurrió un error al procesar la propuesta." });
            } else {
                await interaction.reply({ content: "❌ Ocurrió un error al procesar la propuesta.", flags: MessageFlags.Ephemeral });
            }
        }
    }
};
