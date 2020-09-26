import * as Discord from 'discord.js';
import { EMOJI_IDENTIFIER_MAP, Emojis } from './types';
import MemeController from './controllers/meme.controller';

async function handleReaction(reaction: Discord.MessageReaction, user: Discord.User, client: Discord.Client) {
    const reactionUser = user.username + '#' + user.discriminator;
    const botUser = client.user.username + '#' + user.discriminator;
    const identifier = reaction.emoji.identifier;
    const messageContent = reaction.message.content;
    if (reactionUser !== botUser && identifier in EMOJI_IDENTIFIER_MAP) {
        switch (EMOJI_IDENTIFIER_MAP[identifier]) {
            case Emojis.Approve:
                console.info(`${reactionUser} approves of ${messageContent}`);
                const maybeMeme = await MemeController.FindMeme(messageContent);
                if (maybeMeme == null) {
                    const meme = await MemeController.CreateMeme({
                        name: messageContent,
                        creator: reactionUser,
                        edges: [],
                    });
                    reaction.message.channel.send(`Successfully added meme: "${meme.name}"`);
                } else {
                    console.info(`${messageContent} already exists as a meme`);
                }
                break;
            case Emojis.Reject:
                console.info(`${reactionUser} rejects of ${messageContent}`);
                break;
        }
    }
}

export default {
    handleReaction,
};
