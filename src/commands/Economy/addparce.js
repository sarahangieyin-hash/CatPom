import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { pool } from '../../utils/database.js'; 

// ID del rol de Encargados de Parcelas
const ROL_ENCARGADO_ID = '1536563139489964134';

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
            return interaction.reply({ content: '❌ No tienes permisos de Encargado de Parcelas para usar este comando.', ephemeral: true });
        }

        const nombre = interaction.options.getString('nombre');
        const tipo = interaction.options.getString('tipo');
        const coordenadas = interaction.options.getString('coordenadas');
        const precio = interaction.options.getInteger('precio');
        const foto = interaction.options.getString('foto');

        try {
            await pool.query(
                `INSERT INTO catalogo_parcelas (guild_id, nombre_parcela, tipo, coordenadas, precio, foto_url, estado) VALUES ($1, $2, $3, $4, $5, $6, 'Disponible')`,
                [interaction.guild.id, nombre, tipo, coordenadas, precio, foto]
            );

            await interaction.reply({ content: `✅ ¡Parcela **${nombre}** (Tipo ${tipo}) añadida al catálogo con éxito!` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error al guardar la parcela en la base de datos.', ephemeral: true });
        }
    }
};
