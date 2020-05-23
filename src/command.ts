import * as Discord from 'discord.js';

import { Args, Command, Models } from './types';

const DISCORD_NAME_REGEX = /(.*)#(\d{4})/g;

export const handleCommand = async (
    command: Command,
    args: Args,
    username: string,
    message: Discord.Message,
    models: Models,
) => {
    const { Meme, Users } = models;

    switch (command) {
        default:
            // If the message doesn't parse into a command, it is ignored.
            return;
        case Command.AddMeme:
            await Meme.collection.insertOne({
                // Treat all of the arguments as one strnig so the user doesn't have to use quotes.
                name: args.join(' '),
                creator: username,
            });
            message.channel.send(`Successfully added meme: "${args.join(' ')}"`);
            break;
        case Command.GetMemes:
            const memes = Meme.collection.find();
            memes.toArray().then(async (documents) => {
                let results = documents.map((value) => {
                    return {
                        meme: String(value.name),
                        creator: String(value.creator ?? 'Unknown'),
                    };
                });

                if (args.length > 0) {
                    const discordNames = args[0].toString().match(DISCORD_NAME_REGEX);
                    if (discordNames != null && discordNames.length > 0) {
                        const userFound = await Users.find({
                            name: discordNames[0],
                        }).then((documents) => {
                            return documents.length > 0;
                        });
                        if (userFound) {
                            results = results.filter((meme) => {
                                const compare = discordNames[0].localeCompare(meme.creator);
                                console.log(discordNames[0], meme.creator, compare);
                                return compare == 0;
                            });
                        }
                    }
                }
                const resultStrings = results.map((value, index) => {
                    return index + ': ' + value.meme + ' \n Created By: ' + value.creator;
                });
                message.channel.send('Current memes: \n' + resultStrings.join('\n'));
            });
            break;
        case Command.Roll:
            const result = Math.floor(Math.random() * Number(args[0])) + 1;
            message.channel.send(`Rolled a ${result === 56 ? 'janule' : result}`);
            break;
    }
};
