import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getTreeConfig,
    saveTreeConfig
} from '../../utils/treeConfig.js';



export default {

    data: new SlashCommandBuilder()

        .setName('customizetree')

        .setDescription('Personaliza tu árbol familiar.')

        .addStringOption(option =>
            option
                .setName('fondo')
                .setDescription('Color del fondo (ej: #ffffff)')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('cuadros')
                .setDescription('Color de los cuadros (ej: #ffffff)')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('lineas')
                .setDescription('Color de las líneas (ej: #000000)')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('estilo')
                .setDescription('Estilo de líneas')
                .addChoices(

                    {
                        name: 'Rectas',
                        value: 'straight'
                    },

                    {
                        name: 'Curvas',
                        value: 'curve'
                    }

                )
                .setRequired(false)
        ),



    async execute(interaction) {


        const guildId =
            interaction.guild.id;


        const userId =
            interaction.user.id;



        const oldConfig =
            await getTreeConfig(

                guildId,

                userId

            );



        const config = {


            background:

                interaction.options.getString('fondo')
                ??
                oldConfig.background,



            nodeColor:

                interaction.options.getString('cuadros')
                ??
                oldConfig.nodeColor,



            lineColor:

                interaction.options.getString('lineas')
                ??
                oldConfig.lineColor,



            lineStyle:

                interaction.options.getString('estilo')
                ??
                oldConfig.lineStyle


        };



        await saveTreeConfig(

            guildId,

            userId,

            config

        );



        await interaction.reply({

            content:
                '🎨 Tu árbol familiar ha sido personalizado.',

            ephemeral:
                true

        });


    }

};
