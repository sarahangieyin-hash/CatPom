console.log("USANDO ESTE interactionCreate");

import { Events, EmbedBuilder, MessageFlags } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';
import { addRelation, getUserFamilyData } from '../utils/families.js';

export default {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        // Detectar cuando un usuario pulsa el botón de información general de parcelas
        if (interaction.isButton() && interaction.customId === 'reclamar_parcela_info') {
            return interaction.reply({
                content: '🏛️ **¿Cómo adquirir una parcela en Metztlán?**\n\n' +
                         '1️⃣ Primero, usa el comando `/parcelas` para comprar tu derecho de parcela general.\n' +
                         '2️⃣ Mira el catálogo en `/shoparce` y elige la parcela física que te guste (anota su nombre).\n' +
                         '3️⃣ Contacta con nuestros encargados (etiquetando al rol <@&1536563139489964134>) indicando cuál quieres para que te la asignen oficialmente.'
            });
        }

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

                // Detectar cuando un usuario pulsa el botón de una parcela específica del catálogo
                if (customId.startsWith('comprar_parcela_')) {
                    const nombreParcela = customId.replace('comprar_parcela_', '');

                    return interaction.reply({
                        content: `🏛️ ¡<@${interaction.user.id}> ha mostrado interés en la parcela **${nombreParcela}**!\n\n` +
                                 `📌 **Siguientes pasos:**\n` +
                                 `1️⃣ Asegúrate de haber comprado tu derecho con \`/parcelas\`.\n` +
                                 `2️⃣ Contacta con nuestros encargados (etiquetando al rol <@&1536563139489964134>) para formalizar la compra de la **${nombreParcela}** y que te la asignen.`
                    });
                }

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
                else if (customId.startsWith("poll_")) {
                    const parts = customId.split("_");
                    customId = "poll";
                    args = parts.slice(1); // Pasa ['close'], ['check'] o [roleId, optionIndex]
                }

                console.log(
                    "🔘 BOTÓN PRESIONADO:",
                    interaction.customId,
                    "-> BUSCANDO:",
                    customId,
                    args
                );

                if (customId === 'accept_adopt' || customId === 'accept_adoption') {
                    const [parentId, childId] = args;

                    if (interaction.user.id !== childId) {
                        return interaction.reply({
                            content: '❌ Esta solicitud de adopción no es para ti.',
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    console.log(`⏳ Intentando guardar en BD -> Servidor: ${interaction.guild.id} | Padre: ${parentId} | Hijo: ${childId}`);
                    
                    const success = await addRelation(interaction.guild.id, parentId, childId, 'parent_child');
                    
                    console.log(`📌 ¿SE GUARDÓ EN LA BASE DE DATOS?: ${success ? '✅ SÍ' : '❌ NO'}`);

                    if (!success) {
                        return interaction.reply({
                            content: '⚠️ Hubo un problema al conectar con la Base de Datos para guardar la adopción.',
                            flags: MessageFlags.Ephemeral
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
                            flags: MessageFlags.Ephemeral
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

                /*
                    MANEJADOR DE AMPLIACIÓN DE MATRIMONIO (Paso 1)
                */
                if (customId === 'expand_marriage_accept' || customId === 'expand_marriage_reject') {
                    const [authorId, targetId] = args;

                    if (customId === 'expand_marriage_reject') {
                        return interaction.update({
                            content: `❌ La pareja actual ha rechazado la ampliación de la unión.`,
                            components: []
                        });
                    }

                    if (customId === 'expand_marriage_accept') {
                        await interaction.update({
                            content: `✅ Has autorizado la ampliación. Enviando propuesta formal al nuevo integrante...`,
                            components: []
                        });

                        const authorFamily = await getUserFamilyData(interaction.guild.id, authorId);
                        const currentGroup = [authorId, ...(authorFamily.spouses || [])];
                        const groupString = currentGroup.join(':');

                        const acceptBtn = {
                            type: 2,
                            style: 3,
                            label: 'Aceptar Matrimonio Múltiple',
                            custom_id: `multimarry_accept:${groupString}:${targetId}`
                        };

                        const rejectBtn = {
                            type: 2,
                            style: 4,
                            label: 'Rechazar',
                            custom_id: `multimarry_reject:${groupString}:${targetId}`
                        };

                        const row = {
                            type: 1,
                            components: [acceptBtn, rejectBtn]
                        };

                        const mentions = currentGroup.map(id => `<@${id}>`).join(', ');

                        return interaction.followUp({
                            content: `💍 <@${targetId}>, el grupo actual (${mentions}) te ha propuesto unirte a su matrimonio múltiple. ¿Aceptas?`,
                            components: [row]
                        });
                    }
                }

                /*
                    MANEJADOR FINAL DE MATRIMONIO MÚLTIPLE (Paso 2)
                */
                if (customId === 'multimarry_accept' || customId === 'multimarry_reject') {
                    const targetId = args.pop();
                    const groupIds = args;

                    if (interaction.user.id !== targetId) {
                        return interaction.reply({ content: '❌ Esta propuesta no es para ti.', flags: MessageFlags.Ephemeral });
                    }

                    if (customId === 'multimarry_reject') {
                        return interaction.update({
                            content: `❌ <@${targetId}> ha rechazado unirse al matrimonio múltiple.`,
                            components: []
                        });
                    }

                    if (customId === 'multimarry_accept') {
                        const allMembers = [...groupIds, targetId];

                        for (let i = 0; i < allMembers.length; i++) {
                            for (let j = i + 1; j < allMembers.length; j++) {
                                await addRelation(interaction.guild.id, allMembers[i], allMembers[j], 'marriage');
                            }
                        }

                        const allMentions = allMembers.map(id => `<@${id}>`).join(', ');

                        return interaction.update({
                            content: `🎉 ¡Felicidades! Se ha actualizado el matrimonio múltiple con éxito. Ahora participan: ${allMentions}. ¡Todos están casados con todos! 💞`,
                            components: []
                        });
                    }
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
};console.log("USANDO ESTE interactionCreate");

import { Events, EmbedBuilder, MessageFlags } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';
import { addRelation, getUserFamilyData } from '../utils/families.js';

export default {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        // Detectar cuando un usuario pulsa el botón de información de parcelas
        if (interaction.isButton() && interaction.customId === 'reclamar_parcela_info') {
            return interaction.reply({
                content: '🏛️ **¿Cómo adquirir una parcela en Metztlán?**\n\n' +
                         '1️⃣ Primero, usa el comando `/parcelas` para comprar tu derecho de parcela general.\n' +
                         '2️⃣ Mira el catálogo en `/shoparce` y elige la parcela física que te guste (anota su nombre).\n' +
                         '3️⃣ Contacta con nuestros encargados (etiquetando al rol <@&1536563139489964134>) indicando cuál quieres para que te la asignen oficialmente.'
            });
        }

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
                else if (customId.startsWith("poll_")) {
                    const parts = customId.split("_");
                    customId = "poll";
                    args = parts.slice(1); // Pasa ['close'], ['check'] o [roleId, optionIndex]
                }

                console.log(
                    "🔘 BOTÓN PRESIONADO:",
                    interaction.customId,
                    "-> BUSCANDO:",
                    customId,
                    args
                );

                if (customId === 'accept_adopt' || customId === 'accept_adoption') {
                    const [parentId, childId] = args;

                    if (interaction.user.id !== childId) {
                        return interaction.reply({
                            content: '❌ Esta solicitud de adopción no es para ti.',
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    console.log(`⏳ Intentando guardar en BD -> Servidor: ${interaction.guild.id} | Padre: ${parentId} | Hijo: ${childId}`);
                    
                    const success = await addRelation(interaction.guild.id, parentId, childId, 'parent_child');
                    
                    console.log(`📌 ¿SE GUARDÓ EN LA BASE DE DATOS?: ${success ? '✅ SÍ' : '❌ NO'}`);

                    if (!success) {
                        return interaction.reply({
                            content: '⚠️ Hubo un problema al conectar con la Base de Datos para guardar la adopción.',
                            flags: MessageFlags.Ephemeral
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
                            flags: MessageFlags.Ephemeral
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

                /*
                    MANEJADOR DE AMPLIACIÓN DE MATRIMONIO (Paso 1)
                */
                if (customId === 'expand_marriage_accept' || customId === 'expand_marriage_reject') {
                    const [authorId, targetId] = args;

                    if (customId === 'expand_marriage_reject') {
                        return interaction.update({
                            content: `❌ La pareja actual ha rechazado la ampliación de la unión.`,
                            components: []
                        });
                    }

                    if (customId === 'expand_marriage_accept') {
                        await interaction.update({
                            content: `✅ Has autorizado la ampliación. Enviando propuesta formal al nuevo integrante...`,
                            components: []
                        });

                        const authorFamily = await getUserFamilyData(interaction.guild.id, authorId);
                        const currentGroup = [authorId, ...(authorFamily.spouses || [])];
                        const groupString = currentGroup.join(':');

                        const acceptBtn = {
                            type: 2,
                            style: 3,
                            label: 'Aceptar Matrimonio Múltiple',
                            custom_id: `multimarry_accept:${groupString}:${targetId}`
                        };

                        const rejectBtn = {
                            type: 2,
                            style: 4,
                            label: 'Rechazar',
                            custom_id: `multimarry_reject:${groupString}:${targetId}`
                        };

                        const row = {
                            type: 1,
                            components: [acceptBtn, rejectBtn]
                        };

                        const mentions = currentGroup.map(id => `<@${id}>`).join(', ');

                        return interaction.followUp({
                            content: `💍 <@${targetId}>, el grupo actual (${mentions}) te ha propuesto unirte a su matrimonio múltiple. ¿Aceptas?`,
                            components: [row]
                        });
                    }
                }

                /*
                    MANEJADOR FINAL DE MATRIMONIO MÚLTIPLE (Paso 2)
                */
                if (customId === 'multimarry_accept' || customId === 'multimarry_reject') {
                    const targetId = args.pop();
                    const groupIds = args;

                    if (interaction.user.id !== targetId) {
                        return interaction.reply({ content: '❌ Esta propuesta no es para ti.', flags: MessageFlags.Ephemeral });
                    }

                    if (customId === 'multimarry_reject') {
                        return interaction.update({
                            content: `❌ <@${targetId}> ha rechazado unirse al matrimonio múltiple.`,
                            components: []
                        });
                    }

                    if (customId === 'multimarry_accept') {
                        const allMembers = [...groupIds, targetId];

                        for (let i = 0; i < allMembers.length; i++) {
                            for (let j = i + 1; j < allMembers.length; j++) {
                                await addRelation(interaction.guild.id, allMembers[i], allMembers[j], 'marriage');
                            }
                        }

                        const allMentions = allMembers.map(id => `<@${id}>`).join(', ');

                        return interaction.update({
                            content: `🎉 ¡Felicidades! Se ha actualizado el matrimonio múltiple con éxito. Ahora participan: ${allMentions}. ¡Todos están casados con todos! 💞`,
                            components: []
                        });
                    }
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
