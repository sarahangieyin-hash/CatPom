import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js';

import {
    getFamilyByMember
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('family')

        .setDescription('Muestra la familia de un usuario.')

        .addUserOption(option =>

            option

                .setName('usuario')

                .setDescription('Usuario')

                .setRequired(false)

        ),


    async execute(interaction) {


        const user =
            interaction.options.getUser('usuario')
            ??
            interaction.user;



        const family =
            await getFamilyByMember(

                interaction.guild.id,

                user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ Ese usuario no pertenece a ninguna familia.',

                ephemeral:
                    true

            });

        }



        const isChild =
            family.children?.some(

                child =>
                    child.id === user.id

            );



        let members = [];
        let children = [];
        let parents = [];
        let siblings = [];



        if (isChild) {


            // El hijo ve su propia relación familiar


            members =
                family.members
                .filter(

                    id =>
                        id !== user.id

                )
                .map(

                    id =>
                        `<@${id}>`

                );


            parents =
                family.members
                .map(

                    id =>
                        `<@${id}>`

                );


            children = [

                `<@${user.id}>`

            ];


            siblings =
                family.children

                .filter(

                    child =>
                        child.id !== user.id

                )

                .map(

                    child =>
                        `<@${child.id}>`

                );



        } else {


            members =
                family.members?.map(

                    id =>
                        `<@${id}>`

                ) || [];



            children =
                family.children?.map(

                    child =>
                        `<@${child.id}>`

                ) || [];



            parents =
                family.parents?.map(

                    parent =>
                        `<@${parent.id}>`

                ) || [];



            siblings =
                family.siblings?.map(

                    sibling =>
                        `<@${sibling.id}>`

                ) || [];


        }



        const embed =
            new EmbedBuilder()

                .setTitle(

                    `👨‍👩‍👧 Familia de ${user.username}`

                )

                .setColor(
                    0x8b5a2b
                )

                .addFields(

                    {

                        name:
                            '💍 Unión',

                        value:
                            members.length
                            ? members.join('\n')
                            : 'Ninguno'

                    },


                    {

                        name:
                            '👶 Hijos',

                        value:
                            children.length
                            ? children.join('\n')
                            : 'Ninguno'

                    },


                    {

                        name:
                            '👨‍👩‍👧 Padres',

                        value:
                            parents.length
                            ? parents.join('\n')
                            : 'Ninguno'

                    },


                    {

                        name:
                            '👥 Hermanos',

                        value:
                            siblings.length
                            ? siblings.join('\n')
                            : 'Ninguno'

                    }

                );


        await interaction.reply({

            embeds:
                [embed]

        });


    }

};
