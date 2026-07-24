import { SlashCommandBuilder } from 'discord.js';
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


        const members = await interaction.guild.members.fetch();


        let ranking = [];


        for (const member of members.values()) {

            if(!member.roles.cache.has(role.id))
                continue;


            if(member.user.bot)
                continue;


            const points = await getPomp(
                interaction.guild.id,
                member.id
            );


            ranking.push({
                name: member.user.username,
                points
            });

        }


        ranking.sort(
            (a,b)=> b.points - a.points
        );


        if(ranking.length === 0){

            return interaction.reply({
                content:`❌ Nadie tiene el rol ${role}.`,
                ephemeral:true
            });

        }


        let table = "";


        ranking.forEach((user,index)=>{

            table +=
            `**${index + 1}.** ${user.name} — 💎 ${user.points} Pomp\n`;

        });



        return interaction.reply({

            embeds:[{

                title:`🏦 Registro de Pomp — ${role.name}`,

                description:table,

                color:"#D4AF37"

            }]

        });

    }
};
