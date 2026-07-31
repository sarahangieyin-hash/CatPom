import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getUserFamilyData } from '../../utils/families.js';
import { renderFamilyTree } from '../../family/render/treeRenderer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('tree')
        .setDescription('Muestra el árbol familiar.'),

    async execute(interaction) {
        try {
            const family = await getUserFamilyData(
                interaction.guild.id,
                interaction.user.id
            );

            const hasFamily =
                family.spouses?.length > 0 ||
                family.children?.length > 0 ||
                family.parents?.length > 0 ||
                family.siblings?.length > 0 ||
                family.lovers?.length > 0;

            if (!hasFamily) {
                return interaction.reply({
                    content: '❌ No tienes familia registrada.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // ⚠️ FIX: Inyectamos explícitamente el usuario raíz en el objeto family
            // para que el renderizador sepa a quién debe dibujar en el centro
            family.userId = interaction.user.id;
            family.rootUser = interaction.user;

            await interaction.deferReply();

            const image = await renderFamilyTree(
                interaction.guild,
                family
            );

            await interaction.editReply({
                files: [
                    {
                        attachment: image,
                        name: 'arbol-familiar.png'
                    }
                ]
            });

        } catch (error) {
            console.error("ERROR GENERANDO TREE:", error);

            if (interaction.deferred) {
                await interaction.editReply({
                    content: "❌ Error generando árbol: " + error.message
                });
            } else {
                await interaction.reply({
                    content: "❌ Error generando árbol: " + error.message,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
