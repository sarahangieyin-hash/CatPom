import { EmbedBuilder } from 'discord.js';
import { BotConfig } from '../config/bot.js';


export function createEmbed(options = {}) {

    const embed = new EmbedBuilder();


    if (options.title) {
        embed.setTitle(options.title);
    }


    if (options.description) {
        embed.setDescription(options.description);
    }


    embed.setColor(
        options.color ?? BotConfig.embeds.colors.primary
    );


    if (options.footer) {
        embed.setFooter({
            text: options.footer
        });
    }


    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }


    if (options.image) {
        embed.setImage(options.image);
    }


    return embed;
}



export function successEmbed(description) {

    return createEmbed({

        description,

        color: BotConfig.embeds.colors.success

    });

}



export function errorEmbed(description) {

    return createEmbed({

        description,

        color: BotConfig.embeds.colors.error

    });

}



export function infoEmbed(description) {

    return createEmbed({

        description,

        color: BotConfig.embeds.colors.info

    });

}



export function warningEmbed(description) {

    return createEmbed({

        description,

        color: '#FEE75C'

    });

}



export function buildUserErrorEmbed(type, description) {

    return createEmbed({

        title: 'Error',

        description,

        color: BotConfig.embeds.colors.error

    });

}
