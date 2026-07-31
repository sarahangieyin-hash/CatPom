import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getUserFamilyData } from '../../utils/families.js';
import { renderFamilyTree } from '../../family/render/treeRenderer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('tree')
        .setDescription('Muestra la imagen del árbol familiar.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario del que quieres ver el árbol')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const targetUser = interaction.options?.getUser('usuario') || interaction.user;

            const family = await getUserFamilyData(
                interaction.guild.id,
                targetUser.id
            );

            const hasFamily =
                family.spouses?.length > 0 ||
                family.children?.length > 0 ||
                family.parents?.length > 0 ||
                family.siblings?.length > 0 ||
                family.lovers?.length > 0;

            if (!hasFamily) {
                return interaction.reply({
                    content: `❌ ${targetUser.id === interaction.user.id ? 'No tienes' : 'El usuario no tiene'} familia registrada.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            family.userId = targetUser.id;
            family.rootUser = targetUser;

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
