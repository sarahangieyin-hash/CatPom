import { MessageFlags, EmbedBuilder } from 'discord.js';

export default {
    customId: 'poll',

    async execute(interaction, client, args) {
        const roleId = args[0];
        const optionIndex = parseInt(args[1]);

        // Verificar si tiene el rol permitido
        if (!interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({
                content: `❌ Solo los miembros con el rol <@&${roleId}> pueden votar en esta encuesta.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const message = interaction.message;
        const embed = message.embeds[0];

        if (!embed) {
            return interaction.reply({
                content: '❌ No se pudo encontrar el embed de la encuesta.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Extraer las líneas de la descripción actual
        const lines = embed.description.split('\n');
        
        // Buscamos las líneas de las opciones y actualizamos los votos sumando +1 a la opción seleccionada
        let updatedDescription = lines.map(line => {
            if (line.includes(`🔹 **Opción ${optionIndex + 1}:**`)) {
                // Ejemplo de línea: 🔹 **Opción 1:** Sí (0 votos)
                const match = line.match(/\((\d+)\s+votos?\)/);
                if (match) {
                    const currentVotes = parseInt(match[1]);
                    // Reemplazamos el número de votos anterior por el nuevo incrementado
                    return line.replace(/\(\d+\s+votos?\)/, `(${currentVotes + 1} votos)`);
                }
            }
            return line;
        }).join('\n');

        // Construir el nuevo embed actualizado
        const updatedEmbed = EmbedBuilder.from(embed)
            .setDescription(updatedDescription);

        // Actualizar el mensaje público con el nuevo conteo
        await message.edit({ embeds: [updatedEmbed] });

        // Confirmar de forma privada al usuario que su voto fue registrado
        await interaction.reply({
            content: `✅ ¡Tu voto para la opción ${optionIndex + 1} ha sido registrado con éxito!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
