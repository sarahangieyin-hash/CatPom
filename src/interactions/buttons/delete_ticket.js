export default {

    customId: "delete_ticket",


    async execute(interaction) {


        await interaction.reply({

            content:
                "Eliminando ticket..."

        });


        setTimeout(() => {

            interaction.channel.delete()
                .catch(() => {});

        }, 3000);


    }

};
