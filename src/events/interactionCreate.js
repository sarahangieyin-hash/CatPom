console.log("USANDO ESTE interactionCreate");

import { Events, EmbedBuilder, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';
import { addRelation, getUserFamilyData } from '../utils/families.js';
import { addPomp } from '../utils/points.js';

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

                // 1. Manejador para aprobar/rechazar compra de parcelas físicas (Staff)
                if (customId.startsWith('aprobar_parcela_') || customId.startsWith('rechazar_parcela_')) {
                    const parts = customId.split('_');
                    const accion = parts[0]; // aprobar o rechazar
                    const solicitudId = parts[2];
                    const compradorId = parts[3];

                    if (accion === 'aprobar') {
                        const idParcela = parseInt(parts[4]);

                        let dataParcelas = {};
                        const parcelasPath = path.resolve('src/data/parcelas.json');
                        
                        if (fs.existsSync(parcelasPath)) {
                            try { dataParcelas = JSON.parse(fs.readFileSync(parcelasPath, 'utf8')); } catch (e) {}
                        }

                        const guildId = interaction.guild.id;
                        if (dataParcelas[guildId] && dataParcelas[guildId][idParcela - 1]) {
                            dataParcelas[guildId][idParcela - 1].estado = 'Ocupada';
                            dataParcelas[guildId][idParcela - 1].propietarioId = compradorId;
                            fs.writeFileSync(parcelasPath, JSON.stringify(dataParcelas, null, 2));
                        }

                        return interaction.update({
                            content: `✅ **Parcela asignada oficialmente** a <@${compradorId}> por el encargado <@${interaction.user.id}>.`,
                            components: []
                        });
                    } else {
                        // Si se rechaza, devolvemos el derecho al inventario del usuario
                        const tipoRequerido = parts[5];
                        const invPath = path.resolve('src/data/inventario_parcelas.json');
                        const guildId = interaction.guild.id;

                        if (tipoRequerido) {
                            let inventario = {};
                            if (fs.existsSync(invPath)) {
                                try { inventario = JSON.parse(fs.readFileSync(invPath, 'utf8')); } catch (e) {}
                            }
                            if (inventario[guildId] && inventario[guildId][compradorId]) {
                                inventario[guildId][compradorId][tipoRequerido] += 1;
                                fs.writeFileSync(invPath, JSON.stringify(inventario, null, 2));
                            }
                        }

                        return interaction.update({
                            content: `❌ **Solicitud de parcela rechazada** por <@${interaction.user.id}>. El derecho ha sido devuelto al inventario del usuario.`,
                            components: []
                        });
                    }
                }

                // 2. Manejador para contratos de devolución firmados por encargados (Staff)
                if (customId.startsWith('aprobar_devolucion_') || customId.startsWith('rechazar_devolucion_')) {
                    const parts = customId.split('_');
                    const accion = parts[0]; // aprobar o rechazar
                    const solicitudId = parts[2];

                    if (accion === 'aprobar') {
                        const idParcela = parseInt(parts[3]);
                        const propietarioId = parts[4];
                        const tipoParcela = parts[5];
                        const precioDevolver = parseInt(parts[6]);

                        // Liberar parcela física
                        const parcelasPath = path.resolve('src/data/parcelas.json');
                        let dataParcelas = {};
                        if (fs.existsSync(parcelasPath)) {
                            try { dataParcelas = JSON.parse(fs.readFileSync(parcelasPath, 'utf8')); } catch (e) {}
                        }

                        const guildId = interaction.guild.id;
                        if (dataParcelas[guildId] && dataParcelas[guildId][idParcela - 1]) {
                            dataParcelas[guildId][idParcela - 1].estado = 'Disponible';
                            delete dataParcelas[guildId][idParcela - 1].propietarioId;
                            fs.writeFileSync(parcelasPath, JSON.stringify(dataParcelas, null, 2));
                        }

                        // Devolver los Pomp al usuario
                        await addPomp(guildId, propietarioId, precioDevolver);

                        // Devolver el derecho al inventario del usuario
                        const invPath = path.resolve('src/data/inventario_parcelas.json');
                        let inventario = {};
                        if (fs.existsSync(invPath)) {
                            try { inventario = JSON.parse(fs.readFileSync(invPath, 'utf8')); } catch (e) {}
                        }

                        if (!inventario[guildId]) inventario[guildId] = {};
                        if (!inventario[guildId][propietarioId]) inventario[guildId][propietarioId] = { A: 0, B: 0, C: 0 };
                        inventario[guildId][propietarioId][tipoParcela] += 1;
                        fs.writeFileSync(invPath, JSON.stringify(inventario, null, 2));

                        return interaction.update({
                            content: `✅ **Contrato firmado y aprobado** por <@${interaction.user.id}>.\n- Parcela #${idParcela} liberada.\n- Reembolsados **${precioDevolver} Pomp** a <@${propietarioId}>.\n- 1x Parcela Tipo ${tipoParcela} devuelta a su inventario.`,
                            components: []
                        });
                    } else {
                        return interaction.update({
                            content: `❌ **Contrato de devolución rechazado** por <@${interaction.user.id}>.`,
                            components: []
                        });
                    }
                }

                // Detectar compra de derecho general en /parcelas
                if (customId.startsWith('buy_plot_')) {
                    const tipoParcela = customId.replace('buy_plot_', '');
                    let precio = 0;

                    if (tipoParcela === 'C') precio = 500;
                    if (tipoParcela === 'B') precio = 1000;
                    if (tipoParcela === 'A') precio = 2500;

                    return interaction.reply({
                        content: `🏛️ ¡<@${interaction.user.id}> ha adquirido el derecho de una **Parcela Tipo ${tipoParcela}** por **${precio} puntos**!\n\n` +
                                     `📌 **Siguiente paso:** Ve a \`/shoparce\` para ver las parcelas físicas disponibles y elige la tuya.`
                    });
                }

                // Detectar cuando un usuario pulsa el botón de una parcela específica del catálogo en /shoparce
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
                    args = parts.slice(1);
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
