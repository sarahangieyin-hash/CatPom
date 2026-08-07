import { Events } from 'discord.js';
import { afkUsers } from '../utils/afkManager.js';

export default {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const guildAfk = afkUsers.get(guildId);

        // 1. Si el usuario que habla estaba AFK, le quitamos el estado
        if (guildAfk?.has(userId)) {
            guildAfk.delete(userId);
            
            try {
                const member = message.member;
                if (member && member.manageable && member.displayName.includes('[AFK]')) {
                    const originalName = member.displayName.replace('[AFK]', '').trim();
                    await member.setNickname(originalName).catch(() => {});
                }
            } catch (e) {}

            const welcomeBack = await message.reply(`👋 ¡Bienvenido de nuevo, <@${userId}>! He quitado tu estado de AFK.`);
            setTimeout(() => welcomeBack.delete().catch(() => {}), 5000);
        }

        // 2. Si mencionan a alguien que está AFK, avisamos
        if (message.mentions.users.size > 0 && guildAfk) {
            message.mentions.users.forEach(mentionedUser => {
                if (mentionedUser.id === message.author.id) return;

                if (guildAfk.has(mentionedUser.id)) {
                    const afkData = guildAfk.get(mentionedUser.id);
                    const tiempoTotalSegundos = Math.floor((Date.now() - afkData.timestamp) / 1000);
                    
                    const horas = Math.floor(tiempoTotalSegundos / 3600);
                    const minutos = Math.floor((tiempoTotalSegundos % 3600) / 60);
                    const segundos = tiempoTotalSegundos % 60;

                    let tiempoTexto = "";
                    if (horas > 0) tiempoTexto += `${horas}h `;
                    if (minutos > 0) tiempoTexto += `${minutos}m `;
                    tiempoTexto += `${segundos}s`;

                    message.reply({
                        content: `💤 **${mentionedUser.username}** está AFK desde hace ${tiempoTexto}.\n📌 **Motivo:** ${afkData.reason}`
                    }).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 10000);
                    }).catch(() => {});
                }
            });
        }
    }
};
