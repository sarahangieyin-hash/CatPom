import {
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

export default {

    customId: "join_server",

    async execute(interaction) {

        // Solo quien abrió el ticket puede elegir
        const channel = interaction.channel;

        if (channel.type !== ChannelType.GuildText)
            return;

        // Desactivar botones
        const message = interaction.message;

        const disabledRow = new ActionRowBuilder();

        for (const component of message.components[0].components) {

            disabledRow.addComponents(

                ButtonBuilder
                    .from(component)
                    .setDisabled(true)

            );

        }

        await interaction.update({
            components: [disabledRow]
        });

        // Renombrar canal
        const displayName =
            interaction.member.displayName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-")
                .slice(0, 40);

        await channel.setName(
            `🪪・verificación・${displayName}`
        );

        // Guardar información en el topic
        await channel.setTopic(
`owner=${interaction.user.id}
type=verification`
        );

        // Enviar información
        const embed = new EmbedBuilder()

            .setColor(0x57F287)

            .setTitle("🪪 Verificación")

            .setDescription(`Antes de darte acceso al servidor debemos completar una pequeña verificación. Todo el proceso se realizará desde este ticket.

### 1. Usuario de Minecraft
Indícanos tu nombre de usuario de Minecraft en <#1518347843935539320>.

### 2. Audio de verificación
Manda un audio diciendo un trabalenguas en <#1530837580667682957>. Es una medida de seguridad para mantener la comunidad exclusivamente para mujeres.

### 3. Elegir un pueblo
Cuando hayamos completado la verificación, podrás escoger uno de nuestros tres pueblos en <#1526731395790016545>: **Metztlan**, **Sakura** o **Hrafheim**.

Si tienes cualquier duda durante el proceso, pregúntanos por este mismo ticket o menciona a <@&1515791573026082948>.`);

        await channel.send({

            content: `${interaction.user}`,

            embeds: [embed]

        });

    }

};
