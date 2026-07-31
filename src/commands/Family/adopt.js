import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { addRelation } from '../../utils/families.js';

export default {
    name: 'adopt',
    description: 'Adopta a un usuario para añadirlo como hijo/a.',

    async execute(interaction) {
        // Si la interacción es la ejecución del comando inicial /adopt
        if (interaction.isChatInputCommand?.() || interaction.isCommand?.()) {
            const target = interaction.options.getUser('usuario');

            if (!target) {
                return interaction.reply({ content: '❌ Debes mencionar a un usuario para adoptarlo.', ephemeral: true });
            }

            if (target.id === interaction.user.id) {
                return interaction.reply({ content: '❌ No puedes adoptarte a ti mismo.', ephemeral: true });
            }

            if (target.bot) {
                return interaction.reply({ content: '❌ No puedes adoptar a un bot.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('👶 Solicitud de Adopción')
                .setDescription(`¡Hola ${target}! ${interaction.user} quiere **adoptarte** como su hijo/a.\n\n¿Aceptas ser adoptado/a?`)
                .setColor('#3b82f6')
                .setFooter({ text: 'Responde a la solicitud usando los botones.' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_adopt:${interaction.user.id}:${target.id}`)
                    .setLabel('Aceptar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_adopt:${interaction.user.id}:${target.id}`)
                    .setLabel('Rechazar')
                    .setStyle(ButtonStyle.Danger)
            );

            return interaction.reply({ embeds: [embed], components: [row] });
        }

        // Si la interacción viene de un BOTÓN (accept_adopt)
        if (interaction.isButton?.()) {
            const [action, parentId, childId] = interaction.customId.split(':');

            if (action === 'accept_adopt') {
                // Verificar que solo el usuario adoptado pueda responder
                if (interaction.user.id !== childId) {
                    return interaction.reply({
                        content: '❌ Esta solicitud de adopción no es para ti.',
                        ephemeral: true
                    });
                }

                // 🎯 1. GUARDAR EN LA BASE DE DATOS CORRECTAMENTE
                // addRelation(guildId, u1=Padre, u2=Hijo, type)
                await addRelation(interaction.guild.id, parentId, childId, 'parent_child');

                // 🎯 2. CREAR EMBED DE ÉXITO LIMPIO (Reemplaza al anterior)
                const successEmbed = new EmbedBuilder()
                    .setTitle('👶 ¡Adopción Completada!')
                    .setDescription(`¡Felicidades! <@${childId}> ha sido adoptado/a oficialmente por <@${parentId}>.`)
                    .setColor('#22c55e')
                    .setTimestamp();

                // Actualizamos el mensaje original eliminando los botones y reemplazando el embed viejo
                return interaction.update({
                    embeds: [successEmbed],
                    components: []
                });
            }

            if (action === 'deny_adopt') {
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
        }
    }
};
