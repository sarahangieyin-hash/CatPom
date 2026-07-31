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

                if (customId.includes(":")) {
                    const parts = customId.split(":");
                    customId = parts[0];
                    args = parts.slice(1);
                }
                else if (customId.startsWith("accept_adoption_")) {
                    const parts = customId.split("_");
                    customId = "accept_adoption";
                    args = [parts[2], parts[3]];
                }

                console.log(
                    "🔘 BOTÓN PRESIONADO:",
                    interaction.customId,
                    "-> BUSCANDO:",
                    customId,
                    args
                );

                // 🎯 MANEJO DIRECTO DE ADOPCIONES CON DIAGNÓSTICO
                if (customId === 'accept_adopt' || customId === 'accept_adoption') {
                    const [parentId, childId] = args;

                    if (interaction.user.id !== childId) {
                        return interaction.reply({
                            content: '❌ Esta solicitud de adopción no es para ti.',
                            ephemeral: true
                        });
                    }

                    console.log(`⏳ Intentando guardar en BD -> Servidor: ${interaction.guild.id} | Padre: ${parentId} | Hijo: ${childId}`);
                    
                    // Guardar en la Base de Datos PostgreSQL
                    const success = await addRelation(interaction.guild.id, parentId, childId, 'parent_child');
                    
                    console.log(`📌 ¿SE GUARDÓ EN LA BASE DE DATOS?: ${success ? '✅ SÍ' : '❌ NO'}`);

                    if (!success) {
                        return interaction.reply({
                            content: '⚠️ Hubo un problema al conectar con la Base de Datos para guardar la adopción.',
                            ephemeral: true
                        });
                    }

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

                const button = client.buttons?.get(customId);

                if (!button) {
                    console.log("⚠️ BOTÓN NO ENCONTRADO EN CLIENT.BUTTONS:", customId);
                    return;
                }

                await button.execute(interaction, client, args);
                return;
            }

            /*
                MENÚS
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
