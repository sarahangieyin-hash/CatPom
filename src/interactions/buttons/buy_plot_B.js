import { getPomp, removePomp } from '../../utils/points.js';
import fs from 'fs';
import path from 'path';

const invPath = path.resolve('src/data/inventario_parcelas.json');

export default {

    customId: 'buy_plot_B',

    async execute(interaction) {

        const price = 1000;
        const tipo = 'B';

        const points = await getPomp(
            interaction.guild.id,
            interaction.user.id
        );

        if (points < price) {
            return interaction.reply({
                content: `❌ No tienes suficientes Pomp. Necesitas **${price}** y tienes **${points}**.`
            });
        }

        await removePomp(
            interaction.guild.id,
            interaction.user.id,
            price
        );

        // Guardar el derecho en el inventario
        let inventario = {};
        if (fs.existsSync(invPath)) {
            try { inventario = JSON.parse(fs.readFileSync(invPath, 'utf8')); } catch (e) {}
        }

        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        if (!inventario[guildId]) inventario[guildId] = {};
        if (!inventario[guildId][userId]) inventario[guildId][userId] = { A: 0, B: 0, C: 0 };

        inventario[guildId][userId][tipo] += 1;
        fs.writeFileSync(invPath, JSON.stringify(inventario, null, 2));

        const totalTengo = inventario[guildId][userId][tipo];

        await interaction.reply({
            content: `🏡 Compraste el derecho de **Parcela Tipo B**.\n💎 Gastaste **${price} Pomp**.\n📦 ¡Añadido a tu inventario! (Tienes **${totalTengo}** disponibles de este tipo).\n\n📌 **Siguiente paso:** Ve a \`/shoparce\`, anota el ID de la parcela que quieras y usa \`/buy <id>\`.`
        });

    }

};
