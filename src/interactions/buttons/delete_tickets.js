export default {

    customId: "delete_ticket",

    async execute(interaction) {

        const member =
            interaction.guild.members.cache.get(
                interaction.user.id
            );


        if (
            !member?.roles.cache.has(
                "1515791573026082948"
            )
        ) {

            return interaction.reply({

                content:
                    "❌ Solo el equipo administrativo puede eliminar tickets.",

                ephemeral: true

            });

        }


        await interaction.reply({

            content:
                "El ticket se eliminará en 5 segundos..."

        });


        setTimeout(async () => {

            try {

                await interaction.channel.delete();

            } catch {}

        }, 5000);

    }

};
