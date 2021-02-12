import * as Discord from 'discord.js';
import { EMOJI_IDENTIFIER_MAP, Emojis, JANULE_SYNTHESIS, JANULE_SYNTHESIS_MEME_SEED } from './types';
import MemeController from './controllers/meme.controller';
import { IMeme } from './models/meme.model';
import * as log from 'log-to-file';

async function handleReaction(reaction: Discord.MessageReaction, user: Discord.User, client: Discord.Client) {
    const reactionUser = user.username + '#' + user.discriminator;
    const botUser = client.user.username + '#' + client.user.discriminator;
    const identifier = reaction.emoji.identifier;
    const messageEmbeds = reaction.message.embeds;
    if (reactionUser !== botUser && identifier in EMOJI_IDENTIFIER_MAP) {
        switch (EMOJI_IDENTIFIER_MAP[identifier]) {
            case Emojis.Approve:
                if (messageEmbeds.length > 0) {
                    const embed = messageEmbeds[0];
                    if (embed.fields.length > 0 && embed.fields[0].value == JANULE_SYNTHESIS) {
                        const synthesis = embed.fields[0].name;
                        const reactionLogMessage = `${reactionUser} approves of ${synthesis}`;
                        console.info(reactionLogMessage);
                        log(reactionLogMessage, 'reactions.log');
                        const maybeMeme = await MemeController.FindMeme(synthesis);
                        if (maybeMeme == null) {
                            const edges = [];
                            let memes: IMeme[] = [];
                            if (embed.fields.length > 1 && embed.fields[1].name == JANULE_SYNTHESIS_MEME_SEED) {
                                const originalMemeID = embed.fields[1].value;
                                memes = await MemeController.GetMemesByID([originalMemeID]);
                                edges.push(originalMemeID);
                            }
                            const meme = await MemeController.CreateMeme({
                                name: synthesis,
                                creator: reactionUser,
                                edges: edges,
                            });
                            if (memes.length > 0) {
                                const originalMeme = await MemeController.AddEdge(memes[0], meme._id);
                                reaction.message.channel.send(
                                    `Successfully added meme: "${meme.name}" with an edge to "${originalMeme.name}"`,
                                );
                            } else {
                                reaction.message.channel.send(`Successfully added meme: "${meme.name}"`);
                            }
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
