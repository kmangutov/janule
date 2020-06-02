import * as Discord from 'discord.js';

import { Args, Command, Models } from './types';
import { COMMAND_STRING_PARSE_MAP } from './parse';

const DISCORD_NAME_REGEX = /(.*)#(\d{4})/g;
const A_FLAG = '-a';
const B_FLAG = '-b';

export const handleCommand = async (
    command: Command,
    args: Args,
    username: string,
    message: Discord.Message,
    models: Models,
) => {
    const { Meme, Users, Janule } = models;

    switch (command) {
        default:
            // If the message doesn't parse into a command, it is ignored.
            return;
        case Command.AddMeme:
            await Meme.collection.insertOne({
                // Treat all of the arguments as one string so the user doesn't have to use quotes.
                name: args.join(' '),
                creator: username,
            });
            message.channel.send(`Successfully added meme: "${args.join(' ')}"`);
            break;
        case Command.AddEdge:
            const bIndex = args.findIndex((arg) => arg == B_FLAG);
            if (args[0] == A_FLAG && bIndex != -1) {
                const memeA = args.slice(1, bIndex).join(' ');
                const memeB = args.slice(bIndex + 1).join(' ');
                await Meme.collection
                    .find()
                    .toArray()
                    .then(async (documents) => {
                        const parsedMemes = documents.map((doc) => {
                            return {
                                meme: String(doc.name),
                                id: String(doc._id),
                                edges: (doc.edges as Array<string>) ?? [],
                            };
                        });
                        const memeAObj = parsedMemes.find((meme) => meme.meme == memeA);
                        const memeBObj = parsedMemes.find((meme) => meme.meme == memeB);
                        if (memeAObj != null && memeBObj != null) {
                            const newEdges = memeAObj.edges.concat(memeBObj.id);
                            Meme.collection.updateOne({ name: memeA }, { $set: { edges: newEdges } }, (err) => {
                                if (err != null) {
                                    message.channel.send(`Failed to add edge: ${err}`);
                                } else {
                                    message.channel.send(`Added ${memeB} to ${memeA}'s edges.`);
                                }
                            });
                        } else {
                            message.channel.send(`Meme ${memeA} or ${memeB} not found`);
                        }
                    });
            } else {
                message.channel.send('Usage: !addedge -a memeA -b multi word memeB');
            }
            break;
        case Command.DeleteMeme:
            if (args.length > 0) {
                const memeToDelete = args.join(' ');
                await Meme.collection.deleteOne({
                    name: memeToDelete,
                });
            }
            break;
        case Command.GetMeme:
            if (args.length > 0) {
                const memeArg = args.join(' ');
                Meme.collection
                    .find()
                    .toArray()
                    .then((documents) => {
                        if (documents.length > 0) {
                            const parsedResults = documents.map((doc) => {
                                return {
                                    meme: String(doc.name),
                                    creator: String(doc.creator) ?? 'Unknown',
                                    id: String(doc._id),
                                    edges: doc.edges ?? [],
                                };
                            });
                            const results = parsedResults
                                .filter(
                                    (item) =>
                                        String(item.meme).toLocaleLowerCase().search(memeArg.toLocaleLowerCase()) != -1,
                                )
                                .map((value, index) => {
                                    const memeEdgeNames = value.edges.map((id: string) => {
                                        const memeEdge = parsedResults.find((item) => item.id === id);
                                        return memeEdge.meme;
                                    });
                                    const edges =
                                        memeEdgeNames.length > 0 ? '\n\tEdges: ' + memeEdgeNames.join(', ') : '';
                                    return (
                                        index +
                                        1 +
                                        ': ' +
                                        value.meme +
                                        '\n\tCreated By: ' +
                                        value.creator +
                                        '\n\tID: ' +
                                        value.id +
                                        edges
                                    );
                                });
                            message.channel.send('Results: \n' + results.join('\n'));
                        } else {
                            message.channel.send('No memes found that match: ' + memeArg);
                        }
                    });
            } else {
                message.channel.send('Please specify a meme to get.');
            }
            break;
        case Command.GetMemes:
            const memes = Meme.collection.find();
            memes.toArray().then(async (documents) => {
                let results = documents.map((value) => {
                    return {
                        meme: String(value.name),
                        creator: String(value.creator ? value.creator : 'Unknown'),
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
                            results = results.filter((meme) => discordNames[0].localeCompare(meme.creator) == 0);
                        }
                    }
                }
                let resultString = results
                    .map((value, index) => {
                        return index + ': ' + value.meme + ' \n Created By: ' + value.creator;
                    })
                    .join('\n');
                // Discord has a message length cap of 2000 characters and 'Current memes: \n' is 16 characters.
                // Not a reference to 1984
                if (resultString.length > 1984) {
                    resultString = resultString.slice(0, 1984);
                }
                message.channel.send('Current memes: \n' + resultString);
            });
            break;
        case Command.GetUsers:
            Users.collection
                .find()
                .toArray()
                .then(async (documents) => {
                    const results = documents.map((value, index) => index + 1 + ': ' + value.name);
                    message.channel.send('Current Users: \n' + results.join('\n'));
                });
            break;
        case Command.Help:
            const keys = Object.keys(COMMAND_STRING_PARSE_MAP);
            message.channel.send(`Available Commands: \n\t${keys.join('\n\t')}`);
            break;
        case Command.Roll:
            const result = Math.floor(Math.random() * Number(args[0])) + 1;
            message.channel.send(`Rolled a ${result === 56 ? 'janule' : result}`);
            break;
        case Command.RollMeme:
            Meme.collection
                .find()
                .toArray()
                .then((documents) => {
                    const idx = Math.floor(Math.random() * documents.length) + 1;
                    message.channel.send(documents[idx].name);
                });
            break;
        case Command.Thanks:
            await Janule.collection
                .find()
                .toArray()
                .then(async (documents) => {
                    if (documents.length == 1) {
                        const thanks = documents[0];
                        const updatedThanks = await Janule.findOneAndUpdate(
                            { thanksCount: thanks.thanksCount },
                            { $set: { thanksCount: thanks.thanksCount + 1 } },
                            { new: true },
                        );
                        message.channel.send(
                            `I appreciate you! I've been thanked ${updatedThanks.toObject().thanksCount} times!`,
                        );
                    } else {
                        message.channel.send('I appreciate you, but my thanks count is broken :(');
                    }
                });
            break;
    }
};
