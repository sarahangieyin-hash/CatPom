import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} from 'discord.js';
import { getUserFamilyData, saveFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('Propropón matrimonio a alguien o pide a tu pareja actual ampliar la unión.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('La persona a la que quieres proponer matrimonio')
                .setRequired(true)
        ),

    async execute(interaction) {
        const author = interaction.user;
        const target = interaction.options.getUser('usuario');

        if (author.id === target.id) {
            return interaction.reply({ content: '❌ No puedes casarte contigo mismo.', flags: MessageFlags.Ephemeral });
        }

        const family = await getUserFamilyData(interaction.guild.id, author.id);
        const spouses = family.spouses || [];

        // CASO 1: Ya está casado con la persona a la que intenta proponerle matrimonio de nuevo
        if (spouses.includes(target.id)) {
            return interaction.reply({ content: `❌ Ya estás casado/a con ${target.username}.`, flags: MessageFlags.Ephemeral });
        }

        // CASO 2: EL USUARIO YA ESTÁ CASADO (Quiere proponer un trío/ampliar)
        if (spouses.length > 0) {
            const currentSpouseId = spouses[0]; // Tomamos a la pareja actual principal
            const currentSpouse = await interaction.guild.members.fetch(currentSpouseId).catch(() => null);

            if (!currentSpouse) {
                return interaction.reply({ content: '❌ No se pudo encontrar a tu pareja actual para pedirle autorización.', flags: MessageFlags.Ephemeral });
            }

            // Creamos un botón para que la pareja actual acepte ampliar la unión
            const acceptBtn = new ButtonBuilder()
                .setCustomId(`expand_marriage_accept_${author.id}_${target.id}`)
                .setLabel('Aceptar Ampliación (Trío)')
                .setStyle(ButtonStyle.Success);

            const rejectBtn = new ButtonBuilder()
                .setCustomId(`expand_marriage_reject_${author.id}_${target.id}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(acceptBtn, rejectBtn);

            await interaction.reply({
                content: `💍 <@${author.id}> ya está casado/a contigo, pero quiere proponerle matrimonio a <@${target.id}> para formar una unión múltiple.\n¿Autorizas que se amplíe la unión?`,
                components: [row]
            });
            return;
        }

        // CASO 3: SOLTERO (Matrimonio tradicional de 2 personas)
        const targetFamily = await getUserFamilyData(interaction.guild.id, target.id);
        if (targetFamily.spouses && targetFamily.spouses.length > 0) {
            return interaction.reply({ content: `❌ ${target.username} ya está casado/a con otra persona.`, flags: MessageFlags.Ephemeral });
        }

        const acceptBtn = new ButtonBuilder()
            .setCustomId(`accept_marriage_${author.id}_${target.id}`)
            .setLabel('Aceptar')
            .setStyle(ButtonStyle.Success);

        const rejectBtn = new ButtonBuilder()
            .setCustomId(`reject_marriage_${author.id}_${target.id}`)
            .setLabel('Rechazar')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(acceptBtn, rejectBtn);

        await interaction.reply({
            content: `💍 <@${target.id}>, <@${author.id}> te ha pedido matrimonio. ¿Aceptas?`,
            components: [row]
        });
    }
};
