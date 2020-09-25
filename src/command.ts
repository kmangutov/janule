import * as Discord from 'discord.js';
import { Args, Command } from './types';
import { _STATS } from './index';
import { COMMAND_STRING_PARSE_MAP } from './parse';
import MemeController from './controllers/meme.controller';
import Message from './message';
import Synth from './synth';
import JanuleStatsController from './controllers/januleStats.controller';
import UserController from './controllers/user.controller';
import { renderToFile } from './render';

const A_FLAG = '-a';
const B_FLAG = '-b';

const DISCORD_MAX_MESSAGE_LEN = 2000;

const trimMessage = (prefix: string | null, body: string) => {
    if (prefix === null) {
        return body.slice(0, DISCORD_MAX_MESSAGE_LEN);
    } else {
        return prefix + body.slice(0, DISCORD_MAX_MESSAGE_LEN - prefix.length);
    }
};

export const handleCommand = async (command: Command, args: Args, username: string, message: Discord.Message) => {
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
                    message.channel.send(trimMessage('Results: \n', results));
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
            message.channel.send(trimMessage('Current memes: \n', resultString));
            break;
        case Command.GetUsers:
            const users = await UserController.getUsers();
            const userList = users.map((user, index) => `${index + 1}: ${user.name}`);
            message.channel.send(`Current Users:\n ${userList.join('\n')}`);
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
            const randomMeme = await MemeController.RollMeme();
            message.channel.send(randomMeme.name);
            break;
        case Command.Stats:
            message.channel.send(`Running since: ${_STATS.startTime}`);
            break;
        case Command.Synth:
            let synthesis: string;
            if (args.length > 0) {
                synthesis = await Synth.synthWithArg(args.join(' '));
            } else {
                synthesis = await Synth.synth();
            }
            const flip = Math.floor(Math.random() * 2);
            const preface = flip == 1 ? 'How about: ' : 'Try this: ';
            message.channel.send(preface);
            const synthesisMessage = await message.channel.send(synthesis);
            Message.reactApproveRejectEmojis(synthesisMessage);
            break;
        case Command.Thanks:
            const januleStats = await JanuleStatsController.ThankJanule();
            message.channel.send(`I appreciate you! I've been thanked ${januleStats.thanksCount} times!`);
            break;
        case Command.Graph:
            let renderPromise = renderToFile();
            renderPromise.then((_path: string) => {
                message.channel.send('', {
                    files: [_path],
                });
            });

            break;
    }
};
