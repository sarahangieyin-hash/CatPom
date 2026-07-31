console.log("USANDO ESTE interactionCreate");

import { Events, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';
import { addRelation } from '../utils/families.js';

export default {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        try {
            /*
                COMANDOS
            */
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                await command.execute(interaction, client);
                return;
            }

            /*
                BOTONES
            */
            if (interaction.isButton()) {
                let customId = interaction.customId;
                let args = [];

                /*
                    IDs CON :
                */
                if (customId.includes(":")) {
                    const parts = customId.split(":");
                    customId = parts[0];
                    args = parts.slice(1);
                }
                /*
                    IDs CON _
                    Ej: accept_adoption_PARENT_CHILD
                */
                else if (customId.startsWith("accept_adoption_")) {
                    const parts = customId.split("_");
                    customId = "accept_adoption";
                    args = [parts[2], parts[3]];
                }

                console.log(
                    "BOTON:",
                    interaction.customId,
                    "BUSCANDO:",
                    customId,
                    args
                );

                // 🎯 MANEJO DIRECTO DE ADOPCIONES (Garantiza guardado en BD)
                if (customId === 'accept_adopt' || customId === 'accept_adoption') {
                    const [parentId, childId] = args;

                    if (interaction.user.id !== childId) {
                        return interaction.reply({
                            content: '❌ Esta solicitud de adopción no es para ti.',
                            ephemeral: true
                        });
                    }

                    // Guardar en la Base de Datos PostgreSQL
                    await addRelation(interaction.guild.id, parentId, childId, 'parent_child');

                    const successEmbed = new EmbedBuilder()
                        .setTitle('👶 ¡Adopción Completada!')
                        .setDescription(`¡Felicidades! <@${childId}> ha sido adoptado/a oficialmente por <@${parentId}>.`)
                        .setColor('#22c55e')
                        .setTimestamp();

                    return interaction.update({
                        embeds: [successEmbed],
                        components: []
                    });
                }

                if (customId === 'deny_adopt' || customId === 'deny_adoption') {
                    const [parentId, childId] = args;

                    if (interaction.user.id !== childId) {
                        return interaction.reply({
                            content: '❌ Esta solicitud de adopción no es para ti.',
                            ephemeral: true
                        });
                    }

                    const denyEmbed = new EmbedBuilder()
                        .setTitle('❌ Adopción Rechazada')
                        .setDescription(`<@${childId}> ha rechazado la propuesta de adopción de <@${parentId}>.`)
                        .setColor('#ef4444')
                        .setTimestamp();

                    return interaction.update({
                        embeds: [denyEmbed],
                        components: []
                    });
                }

                // Buscar en la colección registrada en el cliente si no es de adopción
                const button = client.buttons?.get(customId);

                if (!button) {
                    console.log("BOTON NO ENCONTRADO:", customId);
                    return;
                }

                await button.execute(interaction, client, args);
                return;
            }

            /*
                MENUS
            */
            if (interaction.isStringSelectMenu()) {
                const [customId, ...args] = interaction.customId.split(":");
                const menu = client.selectMenus?.get(customId);

                if (!menu) return;

                await menu.execute(interaction, client, args);
                return;
            }

        } catch (error) {
            logger.error("Interaction error:", error);

            if (!interaction.replied && !interaction.deferred) {
                await handleInteractionError(interaction, error);
            }
        }
    }
};
