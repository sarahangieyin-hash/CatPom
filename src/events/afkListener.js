// 2. Si alguien menciona a un usuario que está AFK, avisamos
        if (message.mentions.users.size > 0 && guildAfk) {
            message.mentions.users.forEach(mentionedUser => {
                // No avisar si el usuario AFK se menciona a sí mismo
                if (mentionedUser.id === message.author.id) return;

                if (guildAfk.has(mentionedUser.id)) {
                    const afkData = guildAfk.get(mentionedUser.id);
                    const tiempoTotalSegundos = Math.floor((Date.now() - afkData.timestamp) / 1000);
                    
                    const horas = Math.floor(tiempoTotalSegundos / 3600);
                    const minutos = Math.floor((tiempoTotalSegundos % 3600) / 60);
                    const segundos = tiempoTotalSegundos % 60;

                    // Formatear texto de tiempo de forma legible
                    let tiempoTexto = "";
                    if (horas > 0) tiempoTexto += `${horas}h `;
                    if (minutos > 0) tiempoTexto += `${minutos}m `;
                    tiempoTexto += `${segundos}s`;

                    message.reply({
                        content: `💤 **${mentionedUser.username}** está AFK desde hace ${tiempoTexto}.\n📌 **Motivo:** ${afkData.reason}`
                    }).then(msg => {
                        // El aviso se borra solo a los 10 segundos para no ensuciar el canal
                        setTimeout(() => msg.delete().catch(() => {}), 10000);
                    }).catch(() => {});
                }
            });
        }import { Events } from 'discord.js';
import { afkUsers } from '../utils/afkManager.js'; // IMPORTA EL MISMO MAPA

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildAfk = afkUsers.get(message.guild.id);

        // --- LÓGICA DE QUITAR AFK ---
        if (guildAfk?.has(message.author.id)) {
            guildAfk.delete(message.author.id);
            
            // Quitar apodo
            if (message.member.manageable && message.member.displayName.includes('[AFK]')) {
                await message.member.setNickname(message.member.displayName.replace('[AFK]', '').trim()).catch(() => {});
            }

            const msg = await message.reply(`👋 ¡Hola de nuevo, <@${message.author.id}>! He quitado tu estado AFK.`);
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }

        // --- LÓGICA DE AVISAR A OTROS ---
        if (message.mentions.users.size > 0 && guildAfk) {
            message.mentions.users.forEach(u => {
                if (guildAfk.has(u.id)) {
                    const data = guildAfk.get(u.id);
                    message.reply(`💤 **${u.username}** sigue AFK: ${data.reason}`).catch(() => {});
                }
            });
        }
    }
};
