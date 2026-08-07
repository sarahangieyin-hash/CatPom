import { Events } from 'discord.js';
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
