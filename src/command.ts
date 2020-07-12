import * as Discord from 'discord.js';

import { _STATS } from './index';
import { Args, Command, Models } from './types';
import MemeController from './controllers/meme.controller';
import StrainController from './controllers/strains.controller';
import { CANNABIS_SPECIES_PARSE_MAP } from './models/strains.model';
import { COMMAND_STRING_PARSE_MAP } from './parse';

const A_FLAG = '-a';
const B_FLAG = '-b';
const DASH_DELIMETER = '-';

const DISCORD_MAX_MESSAGE_LEN = 2000;

const JOINT = `</////> ~~~~\n`;

const trimMessage = (prefix: string | null, body: string) => {
    if (prefix === null) {
        return body.slice(0, DISCORD_MAX_MESSAGE_LEN);
    } else {
        return prefix + body.slice(0, DISCORD_MAX_MESSAGE_LEN - prefix.length);
    }
};

export const handleCommand = async (
    command: Command,
    args: Args,
    username: string,
    message: Discord.Message,
    models: Models,
) => {
    // TODO: Fully deprecate the paradigm of passing models through the 'models' parameter. Instead, move fully to the
    // models/controllers paradigm.
    const { Users, Janule } = models;

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
                message.channel.send('Usage: !j addedge -a memeA -b multi word memeB');
            }
            break;
        case Command.AddStrain:
            const addStrainDelimeterIdx = args.findIndex((arg) => arg == DASH_DELIMETER);
            if (args.length > 0 && addStrainDelimeterIdx != -1 && addStrainDelimeterIdx != 0) {
                const strain = args.slice(0, addStrainDelimeterIdx).join(' ');
                const species = args
                    .slice(addStrainDelimeterIdx + 1)
                    .join(' ')
                    .toLocaleLowerCase();
                if (species in CANNABIS_SPECIES_PARSE_MAP) {
                    const speciesType = CANNABIS_SPECIES_PARSE_MAP[species];
                    const strainObj = await StrainController.AddStrain(strain, speciesType);
                    message.channel.send(`Added strain: ${strainObj.strain} - ${strainObj.species}`);
                } else {
                    message.channel.send(`Species ${species} not recognized. Ex. species: h, Hybrid, sativa`);
                }
            } else {
                message.channel.send(`Usage: !j addstrain Hindu Krosh - hybrid`);
            }
            break;
        case Command.DeleteMeme:
            if (args.length > 0) {
                const memeToDelete = args.join(' ');
                await MemeController.DeleteMeme(memeToDelete);
                message.channel.send(`Deleted meme: ${memeToDelete}`);
            }
            break;
        case Command.DeleteStrain:
            const deleteStrainDelimeterIdx = args.findIndex((arg) => arg == DASH_DELIMETER);
            if (args.length > 0 && deleteStrainDelimeterIdx != -1 && deleteStrainDelimeterIdx != 0) {
                const strain = args.slice(0, deleteStrainDelimeterIdx).join(' ');
                const species = args
                    .slice(deleteStrainDelimeterIdx + 1)
                    .join(' ')
                    .toLocaleLowerCase();
                if (species in CANNABIS_SPECIES_PARSE_MAP) {
                    const speciesType = CANNABIS_SPECIES_PARSE_MAP[species];
                    try {
                        await StrainController.DeleteStrain(strain, speciesType);
                        message.channel.send(`Deleted ${strain} - ${species}`);
                    } catch (error) {
                        message.channel.send(`Error deleting ${strain} - ${species}: ${error}`);
                    }
                } else {
                    message.channel.send(`Species ${species} not recognized. Ex. species: h, Hybrid, sativa`);
                }
            } else {
                message.channel.send(`Usage !j deletestrain WoobSex - indica`);
            }
            break;
        case Command.FindStrain:
            if (args.length > 0) {
                const strain = args.join(' ');
                const strainObj = await StrainController.GetStrain(strain);
                if (strainObj != null) {
                    message.channel.send(`${strainObj.strain} - ${strainObj.species}`);
                } else {
                    message.channel.send(`Couldn't find a strain that matched: ${strain}.`);
                }
            } else {
                message.channel.send(`Usage !j findstrain Dank Mangutov`);
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
            const randomMeme = await MemeController.RollMeme();
            message.channel.send(randomMeme.name);
            break;
        case Command.RollJoint:
            const grams = Math.round(Math.random() * 50) / 10;
            const strain = await StrainController.RollStrain();
            message.channel.send(`${JOINT}Yo, here's a ${grams}g ${strain.strain} joint puff puff pass`);
            break;
        case Command.Stats:
            message.channel.send(`Running since: ${_STATS.startTime}`);
            break;
        case Command.Synth:
            const randomSynthMeme = await MemeController.RollMeme();
            if (args.length > 0) {
                let foundMemes = await MemeController.FindMemes(args.join(' '));
                let randomIdx: number;
                if (foundMemes.length == 0) {
                    foundMemes = [await MemeController.RollMeme()];
                    randomIdx = 0;
                } else {
                    const pendingMemeEdges = foundMemes.map(async (meme) => {
                        return await MemeController.GetMemesByID(meme.edges);
                    });
                    const memeEdges2D = await Promise.all(pendingMemeEdges);
                    foundMemes = foundMemes.concat(memeEdges2D.flat());
                    randomIdx = Math.floor(foundMemes.length * Math.random());
                }
                message.channel.send(`Try this: ${foundMemes[randomIdx].name} ${randomSynthMeme.name}`);
            } else {
                const memeAName = randomSynthMeme.name;
                const randomMemeB = await MemeController.RollMeme();
                const memeBName = randomMemeB.name;
                message.channel.send(
                    `How about: ${memeAName.substr(0, memeAName.length / 2)}${memeBName.substr(memeBName.length / 2)}`,
                );
            }
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
