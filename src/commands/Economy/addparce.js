import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const ROL_ENCARGADO_ID = '1536563139489964134';
const filePath = path.resolve('src/data/parcelas.json');

export default {
    data: new SlashCommandBuilder()
        .setName('addparce')
        .setDescription('Añade una nueva parcela al catálogo oficial (Solo Encargados)')
        .addStringOption(o => o.setName('nombre').setDescription('Ej: Parcela Norte 01').setRequired(true))
        .addStringOption(o => o.setName('tipo').setDescription('Tipo de parcela (A, B o C)').setChoices(
            { name: 'Tipo A', value: 'A' },
            { name: 'Tipo B', value: 'B' },
            { name: 'Tipo C', value: 'C' }
        ).setRequired(true))
        .addStringOption(o => o.setName('coordenadas').setDescription('Ej: X: 120, Z: -450').setRequired(true))
        .addIntegerOption(o => o.setName('precio').setDescription('Precio en puntos').setRequired(true))
        .addStringOption(o => o.setName('foto').setDescription('URL de la imagen de la parcela').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ROL_ENCARGADO_ID)) {
            return interaction.reply({ content: '❌ No tienes permisos de Encargado de Parcelas.', flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        const guildId = interaction.guild.id;
        const nombre = interaction.options.getString('nombre');
        const tipo = interaction.options.getString('tipo');
        const coordenadas = interaction.options.getString('coordenadas');
        const precio = interaction.options.getInteger('precio');
        const foto = interaction.options.getString('foto');

        try {
            // Asegurarnos de que el directorio data existe
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Leer datos actuales del JSON
            let data = {};
            if (fs.existsSync(filePath)) {
                try {
                    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                } catch (e) {
                    data = {};
                }
            }

            if (!data[guildId]) {
                data[guildId] = [];
            }

            const nuevaParcela = {
                id: Date.now().toString(),
                nombre,
                tipo,
                coordenadas,
                precio,
                foto,
                estado: 'Disponible',
                propietarioId: null
            };

            data[guildId].push(nuevaParcela);

            // Guardar de vuelta en el archivo JSON
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

            await interaction.editReply({ content: `✅ ¡Parcela **${nombre}** (Tipo ${tipo}) añadida al catálogo con éxito!` });
        } catch (error) {
            console.error('Error al guardar parcela en el JSON:', error);
            await interaction.editReply({ content: '❌ Ocurrió un error al guardar la parcela en el archivo de datos.' });
        }
    }
};
