import * as Discord from 'discord.js';
import { EMOJI_IDENTIFIER_MAP, Emojis, BORGEYES_SYNTHESIS } from './types';
import MemeController from './controllers/meme.controller';

async function handleReaction(reaction: Discord.MessageReaction, user: Discord.User, client: Discord.Client) {
    const reactionUser = user.username + '#' + user.discriminator;
    const botUser = client.user.username + '#' + user.discriminator;
    const identifier = reaction.emoji.identifier;
    const messageEmbeds = reaction.message.embeds;
    if (reactionUser !== botUser && identifier in EMOJI_IDENTIFIER_MAP) {
        switch (EMOJI_IDENTIFIER_MAP[identifier]) {
            case Emojis.Approve:
                if (messageEmbeds.length > 0) {
                    const embed = messageEmbeds[0];
                    if (embed.fields.length > 0 && embed.fields[0].value == BORGEYES_SYNTHESIS) {
                        const synthesis = embed.fields[0].name;
                        console.info(`${reactionUser} approves of ${synthesis}`);
                        const maybeMeme = await MemeController.FindMeme(synthesis);
                        if (maybeMeme == null) {
                            const meme = await MemeController.CreateMeme({
                                name: synthesis,
                                creator: reactionUser,
                                edges: [],
                            });
                            reaction.message.channel.send(`Successfully added meme: "${meme.name}"`);
                        } else {
                            console.info(`${synthesis} already exists as a meme`);
                        }
                    }
                }
                break;
            case Emojis.Reject:
                console.info(`${reactionUser} rejects.`);
                break;
        }
    }
}

export default {
    handleReaction,
};
