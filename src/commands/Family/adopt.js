import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('adopt')

        .setDescription('Adopta una persona.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona que será adoptada')
                .setRequired(true)
        ),


    async execute(interaction) {


        const child =
            interaction.options.getUser('persona');



        if (
            child.id === interaction.user.id
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes adoptarte a ti mismo.',

                ephemeral: true

            });

        }



        let family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        let individualFamily = false;



        if (!family) {


            family =
                await createFamily(

                    interaction.guild.id,

                    [
                        interaction.user.id
                    ]

                );


            individualFamily = true;

        }



        if (
            family.members.includes(
                child.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya pertenece a la familia.',

                ephemeral: true

            });

        }



        if (
            !Array.isArray(
                family.children
            )
        ) {

            family.children = [];

        }



        const adoptedByUser =
            family.children.filter(

                childData =>

                    childData.parent === interaction.user.id

            );



        if (
            adoptedByUser.length >= 5
        ) {

            return interaction.reply({

                content:
                    '❌ Solo puedes adoptar hasta 5 hijos.',

                ephemeral: true

            });

        }



        if (
            family.children.some(

                childData =>

                    childData.id === child.id

            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya es hija de esta familia.',

                ephemeral: true

            });

        }



        family.children.push({

            id:
                child.id,

            parent:
                interaction.user.id,

            adoptedAt:
                Date.now()

        });



        if (
            !family.members.includes(
                child.id
            )
        ) {

            family.members.push(
                child.id
            );

        }



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            individualFamily

                ? `👶 ${child} ha sido adoptado/a por ti.`

                : `👶 ${child} ha sido adoptado/a por la familia.`

        );


    }

};import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('adopt')

        .setDescription('Adopta un hijo dentro de tu unión.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona que será adoptada')
                .setRequired(true)
        ),


    async execute(interaction) {


        const child =
            interaction.options.getUser('persona');



        if (
            child.id === interaction.user.id
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes adoptarte a ti mismo.',

                ephemeral: true

            });

        }



        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ Necesitas pertenecer a una unión.',

                ephemeral: true

            });

        }



        if (
            family.members.includes(
                child.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya pertenece a la unión.',

                ephemeral: true

            });

        }



        if (
            !Array.isArray(
                family.children
            )
        ) {

            family.children = [];

        }



        const adoptedByUser =
            family.children.filter(

                childData =>

                    childData.parent === interaction.user.id

            );



        if (
            adoptedByUser.length >= 5
        ) {

            return interaction.reply({

                content:
                    '❌ Solo puedes adoptar hasta 5 hijos.',

                ephemeral: true

            });

        }



        if (
            family.children.some(

                childData =>

                    childData.id === child.id

            )

        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya es hija de la unión.',

                ephemeral: true

            });

        }



        family.children.push({

            id:
                child.id,

            parent:
                interaction.user.id,

            adoptedAt:
                Date.now()

        });



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `👶 ${child} ha sido adoptado/a por la unión.`

        );


    }

};
