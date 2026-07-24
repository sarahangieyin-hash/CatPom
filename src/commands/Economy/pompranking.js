import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPomp } from '../../utils/points.js';


export default {

    data: new SlashCommandBuilder()
        .setName('pompranking')
        .setDescription('Ver los Pomp de un rol')
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Rol del que quieres ver los Pomp')
                .setRequired(true)
        ),


    async execute(interaction) {


        const role = interaction.options.getRole('rol');


        await interaction.guild.members.fetch();


        let ranking = [];


        for (const member of role.members.values()) {


            if (member.user.bot)
                continue;


            const points = await getPomp(
                interaction.guild.id,
                member.id
            );


            ranking.push({

                id: member.id,
                name: member.user.username,
                points

            });

        }



        if (ranking.length === 0) {

            return interaction.reply({

                content:
                `❌ No hay miembros con el rol ${role}.`,

                ephemeral: true

            });

        }



        ranking.sort(
            (a,b) => b.points - a.points
        );



        let table = "";



        ranking.forEach((user,index)=>{


            let position;


            if(index === 0)
                position = "🥇";

            else if(index === 1)
                position = "🥈";

            else if(index === 2)
                position = "🥉";

            else
                position = `**${index + 1}.**`;



            table +=
            `${position} <@${user.id}> — 💎 **${user.points} Pomp**\n`;


        });



        const embed = new EmbedBuilder()

            .setTitle(`🏦 Registro de Pomp — ${role.name}`)

            .setDescription(table)

            .setColor('#D4AF37')

            .setFooter({

                text:
                'Economía de Metztlán • Ranking por rol'

            });



        return interaction.reply({

            embeds:[embed]

        });


    }

};
