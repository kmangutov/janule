import * as Discord from 'discord.js';

import { Args, Command, Models } from './types';
<<<<<<< HEAD
=======
import MemeController from './controllers/meme.controller';
import { COMMAND_STRING_PARSE_MAP } from './parse';
>>>>>>> d1489ec... Refactored command.ts and broke out User and Memes into their own models and controller

const A_FLAG = '-a';
const B_FLAG = '-b';

export const handleCommand = async (
    command: Command,
    args: Args,
    username: string,
    message: Discord.Message,
    models: Models,
) => {
<<<<<<< HEAD
    const { Meme, Users } = models;
=======
    const { Users, Janule } = models;
>>>>>>> d1489ec... Refactored command.ts and broke out User and Memes into their own models and controller

    switch (command) {
        default:
            // If the message doesn't parse into a command, it is ignored.
            return;
        case Command.AddMeme:
            const memeString = args.join(' ');
            const meme = await MemeController.CreateMeme({ name: memeString, creator: username, edges: [] });
            message.channel.send(`Successfully added meme: "${meme.name}"`);
            break;
        case Command.AddEdge:
            const bIndex = args.findIndex((arg) => arg == B_FLAG);
            if (args[0] == A_FLAG && bIndex != -1) {
                const memeASeachParam = args.slice(1, bIndex).join(' ');
                const memeBSearchParam = args.slice(bIndex + 1).join(' ');
                const memeASearch = await MemeController.FindMemes(memeASeachParam);
                const memeBSearch = await MemeController.FindMemes(memeBSearchParam);
                if (memeASearch.length > 0 && memeBSearch.length > 0) {
                    if (memeASearch.length > 10 || memeBSearch.length > 10) {
                        message.channel.send(`Too many possible memes to add an edge.`);
                    } else {
                        const memeA = memeASearch[0];
                        const memeB = memeBSearch[0];
                        const retVal = await MemeController.AddEdge(memeA, memeB._id);
                        message.channel.send(`Added ${memeB.name} to ${retVal.name}'s edges.`);
                    }
                } else {
                    message.channel.send(`Meme ${memeASeachParam} or ${memeBSearchParam} not found`);
                }
            } else {
                message.channel.send('Usage: !addedge -a memeA -b multi word memeB');
            }
            break;
        case Command.DeleteMeme:
            if (args.length > 0) {
                const memeToDelete = args.join(' ');
                await MemeController.DeleteMeme(memeToDelete);
                message.channel.send(`Deleted meme: ${memeToDelete}`);
            }
            break;
        case Command.GetMeme:
            if (args.length > 0) {
                const memeArg = args.join(' ');
                const memes = await MemeController.FindMemes(memeArg);
                if (memes.length > 0) {
                    let pendingResults = memes.map(async (value, index) => {
                        const memeEdges = await MemeController.GetMemesByID(value.edges);
                        const memeEdgeNames = memeEdges.map((meme) => meme.name);
                        const edges = memeEdgeNames.length > 0 ? '\n\tEdges: ' + memeEdgeNames.join(', ') : '';
                        return (
                            index +
                            1 +
                            ': ' +
                            value.name +
                            '\n\tCreated By: ' +
                            value.creator +
                            '\n\tID: ' +
                            value.id +
                            edges
                        );
                    });
                    const resultStringArray = await Promise.all(pendingResults).then((completed) => {
                        return completed;
                    });
                    let results = resultStringArray.join('\n');
                    if (results.length > 1984) {
                        results = results.slice(0, 1984);
                    }
                    message.channel.send('Results: \n' + results);
                } else {
                    message.channel.send('No memes found that match: ' + memeArg);
                }
            } else {
                message.channel.send('Please specify a meme to get.');
            }
            break;
        case Command.GetMemes:
            const memes = await MemeController.GetMemes();
            let results = memes.map((value) => {
                return {
                    meme: String(value.name),
                    creator: String(value.creator ? value.creator : 'Unknown'),
                };
            });
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
        case Command.Roll:
            const result = Math.floor(Math.random() * Number(args[0])) + 1;
            message.channel.send(`Rolled a ${result === 56 ? 'janule' : result}`);
            break;
        case Command.RollMeme:
<<<<<<< HEAD
            Meme.collection
                .find()
                .toArray()
                .then((documents) => {
                    const idx = Math.floor(Math.random() * documents.length) + 1;
                    message.channel.send(documents[idx].name);
                });
=======
            const randomMeme = await MemeController.RollMeme();
            message.channel.send(randomMeme.name);
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
>>>>>>> d1489ec... Refactored command.ts and broke out User and Memes into their own models and controller
    }
};
