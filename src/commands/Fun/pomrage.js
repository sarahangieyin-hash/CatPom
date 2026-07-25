import { SlashCommandBuilder } from 'discord.js';


const rages = [
    "Imagínate ser tan aburrido que necesitas que un bot te insulte para sentir algo.",
    "Pomp ha analizado tu existencia y ha decidido no gastar más recursos.",
    "Tu cerebro pidió cargar la partida, pero se quedó en pantalla de inicio.",
    "Eres la razón por la que los aldeanos tienen permitido hacer sonidos molestos.",
    "Tu mayor talento es hacer que una tarea sencilla parezca un proyecto de ingeniería.",
    "Pomp quería insultarte, pero hasta él necesita un reto más interesante.",
    "Tu capacidad de tomar buenas decisiones está en modo supervivencia sin comida.",
    "Si la inteligencia fuera un mineral, tú estarías buscando piedra con un pico de madera.",
    "Tu sentido común salió del servidor y no dejó mensaje de despedida.",
    "Has conseguido algo impresionante: decepcionar a un bot.",
    "Tu plan era tan bueno que hasta un creeper decidió no acercarse.",
    "Pomp ha revisado tu estrategia y recomienda empezar de nuevo.",
    "Tu única construcción impresionante es la cantidad de errores que acumulas.",
    "El servidor tiene lag y aun así tus ideas cargan más lento.",
    "Tu brújula apunta al norte, pero tú sigues perdido.",
    "Los zombies tienen más iniciativa cuando salen de noche.",
    "Tu cerebro tiene menos espacio disponible que un cofre lleno de tierra.",
    "Has usado /pomrage porque ni tus amigos tenían ganas de insultarte.",
    "Pomp ha buscado algo positivo que decir y se ha quedado sin resultados.",
    "Tu presencia en el chat es una misión secundaria que nadie aceptó.",
    "Eres como un bloque de tierra: común, abundante y nadie lo está buscando.",
    "Si pensar fuera una granja automática, la tuya estaría sin redstone.",
    "Hasta el inventario de un novato está mejor organizado que tus decisiones.",
    "Pomp confirma que eres una prueba de que los errores también tienen WiFi.",
];


export default {

    data: new SlashCommandBuilder()
        .setName('pomrage')
        .setDescription('Pomp te insulta aleatoriamente'),


    async execute(interaction) {

        const rage = rages[
            Math.floor(Math.random() * rages.length)
        ];


        await interaction.reply(rage);

    }

};
