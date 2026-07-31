import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from "../../utils/embeds.js";
import { createSelectMenu } from "../../utils/components.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_SELECT_ID = "help-category-select";
const ALL_COMMANDS_ID = "help-all-commands";
const HELP_MENU_TIMEOUT_MS = 5 * 60 * 1000;

// Mapeo ajustado a tus 4 categorías reales
const CATEGORY_ICONS = {
    Core: "ℹ️",
    Economy: "💰",
    Family: "🌳",
    Fun: "🎮",
};

function formatCategoryName(rawCategory) {
    return rawCategory
        .replace(/_/g, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function createInitialHelpMenu(clientOrInteraction) {
    const client = clientOrInteraction?.client || clientOrInteraction;
    
    const commandsPath = path.join(__dirname, "../../commands");
    const categoryDirs = (
        await fs.readdir(commandsPath, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();

    const options = [
        {
            label: "📋 Todos los Comandos",
            description: "Ver la lista completa de comandos registrados",
            value: ALL_COMMANDS_ID,
        },
        ...categoryDirs.map((category) => {
            const categoryName = formatCategoryName(category);
            const icon = CATEGORY_ICONS[categoryName] || "🔍";
            return {
                label: `${icon} ${categoryName}`,
                description: `Explorar comandos de la categoría ${categoryName}`,
                value: category,
            };
        }),
    ];

    const botUser = client?.user;
    const botName = botUser?.username || "Bot";
    const avatarUrl = botUser?.displayAvatarURL ? botUser.displayAvatarURL({ size: 1024 }) : null;

    const embed = createEmbed({
        title: `📖 Menú de Ayuda — ${botName}`,
        description: 'Usa el menú desplegable de abajo para explorar las funciones disponibles.',
        color: 'primary',
        thumbnail: avatarUrl,
        fields: [
            {
                name: '🌳 Familia',
                value: 'Crea tu árbol genealógico, casate, adopta hijos o gestiona tu lista de amantes (`/tree`, `/marry`, `/adopt`, `/lover`).',
                inline: false,
            },
            {
                name: '💰 Economía',
                value: 'Gana monedas, consulta tus saldos y participa en el mercado del servidor.',
                inline: false,
            },
            {
                name: '🎮 Diversión',
                value: 'Juegos e interacciones para pasar el rato con la comunidad.',
                inline: false,
            },
            {
                name: 'ℹ️ Core / Ajustes',
                value: 'Comandos base de información y configuración del bot.',
                inline: false,
            },
        ],
    });

    embed.setFooter({ 
        text: `${botName} • Menú Interactivo` 
    });
    embed.setTimestamp();

    const selectRow = createSelectMenu(
        CATEGORY_SELECT_ID,
        "Selecciona una categoría...",
        options,
    );

    return {
        embeds: [embed],
        components: [selectRow],
    };
}

export default {
    slashOnly: true,
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Muestra el menú de ayuda interactivo"),

    async execute(interaction, guildConfig, client) {
        await InteractionHelper.safeDefer(interaction);
        
        const { embeds, components } = await createInitialHelpMenu(client || interaction);

        await InteractionHelper.safeEditReply(interaction, {
            embeds,
            components,
        });

        setTimeout(async () => {
            try {
                if (!InteractionHelper.isInteractionValid(interaction)) {
                    return;
                }

                const closedEmbed = createEmbed({
                    title: "🔒 Menú expirado",
                    description: "El menú de ayuda ha caducado. Vuelve a ejecutar `/help` si lo necesitas.",
                    color: "secondary",
                });

                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [closedEmbed],
                    components: [],
                });
            } catch (error) {
                // Silencioso si expira
            }
        }, HELP_MENU_TIMEOUT_MS);
    },
};
