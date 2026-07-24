import { getMission, updateMission } from '../utils/missions.js';


export default {

customIdPrefix:'join_mission_',


async execute(interaction){

const id = interaction.customId.split('_')[2];


const mission = await getMission(
    interaction.guild.id,
    id
);


if(!mission){
 return interaction.reply({
 content:'❌ Misión no encontrada',
 ephemeral:true
 });
}


if(mission.usuarios.includes(interaction.user.id)){
 return interaction.reply({
 content:'Ya estás apuntado.',
 ephemeral:true
 });
}


mission.usuarios.push(interaction.user.id);


await updateMission(
interaction.guild.id,
id,
mission
);


await interaction.reply({
content:'✅ Te has unido a la misión.',
ephemeral:true
});

}

};
