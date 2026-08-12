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

        await interaction.deferReply({ flags: 64 });

        const guildId = interaction.guild.id;
        const database = interaction.client.db;

        if (!database) {
            return interaction.editReply({ content: '❌ La base de datos no está disponible en este momento.' });
        }

        const nuevaParcela = {
            id: Date.now().toString(),
            nombre: interaction.options.getString('nombre'),
            tipo: interaction.options.getString('tipo'),
            coordenadas: interaction.options.getString('coordenadas'),
            precio: interaction.options.getInteger('precio'),
            foto: interaction.options.getString('foto'),
            estado: 'Disponible',
            propietario_id: null
        };

        try {
            // Obtenemos las parcelas actuales del servidor (o un array vacío si no hay ninguna)
            const storageKey = `guild:${guildId}:parcelas`;
            const parcelasActuales = (await database.get(storageKey)) || [];

            // Añadimos la nueva parcela
            parcelasActuales.push(nuevaParcela);

            // Guardamos de vuelta usando el wrapper oficial del bot
            await database.set(storageKey, parcelasActuales);

            await interaction.editReply({ content: `✅ ¡Parcela **${nuevaParcela.nombre}** (Tipo ${nuevaParcela.tipo}) añadida al catálogo con éxito!` });
        } catch (error) {
            console.error('Error al guardar parcela en la base de datos:', error);
            await interaction.editReply({ content: '❌ Ocurrió un error al guardar la parcela en la base de datos.' });
        }
    }
};
