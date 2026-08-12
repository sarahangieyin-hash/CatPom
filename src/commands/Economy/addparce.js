import { SlashCommandBuilder } from 'discord.js';

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
            return interaction.reply({ content: '❌ No tienes permisos de Encargado de Parcelas.', flags: 64 });
        }

        // 1. Avisamos a Discord inmediatamente para evitar el error de "la aplicación no ha respondido"
        await interaction.deferReply({ flags: 64 });

        const guildId = interaction.guild.id;
        const nombre = interaction.options.getString('nombre');
        const tipo = interaction.options.getString('tipo');
        const coordenadas = interaction.options.getString('coordenadas');
        const precio = interaction.options.getInteger('precio');
        const foto = interaction.options.getString('foto');
        const db = interaction.client.db;

        if (!db) {
            return interaction.editReply({ content: '❌ La base de datos no está disponible en este momento.' });
        }

        try {
            await db.query(
                `CREATE TABLE IF NOT EXISTS parcelas (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(50),
                    nombre VARCHAR(100),
                    tipo VARCHAR(10),
                    coordenadas VARCHAR(100),
                    precio INTEGER,
                    foto TEXT,
                    estado VARCHAR(50) DEFAULT 'Disponible',
                    propietario_id VARCHAR(50)
                )`
            );

            await db.query(
                `INSERT INTO parcelas (guild_id, nombre, tipo, coordenadas, precio, foto, estado) 
                 VALUES ($1, $2, $3, $4, $5, $6, 'Disponible')`,
                [guildId, nombre, tipo, coordenadas, precio, foto]
            );

            await interaction.editReply({ content: `✅ ¡Parcela **${nombre}** (Tipo ${tipo}) añadida a la base de datos con éxito!` });
        } catch (error) {
            console.error('Error al guardar parcela:', error);
            await interaction.editReply({ content: '❌ Ocurrió un error al guardar la parcela en la base de datos.' });
        }
    }
};
