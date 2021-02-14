import * as Discord from 'discord.js';
import { Args, Command, JANULE_SYNTHESIS, JANULE_SYNTHESIS_MEME_SEED } from './types';
import { _STATS } from './index';
import StrainController from './controllers/strains.controller';
import { CANNABIS_SPECIES_PARSE_MAP } from './models/strains.model';
import { COMMAND_STRING_PARSE_MAP } from './parse';
import History from './history/history';
import MemeController from './controllers/meme.controller';
import Message from './message';
import Synth, { SynthWithArgResponse } from './synth';
import JanuleStatsController from './controllers/januleStats.controller';
import UserController from './controllers/user.controller';
import { renderToFile } from './render';
import fetch from 'node-fetch';
import { EmbedFieldData } from 'discord.js';

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
    client: Discord.Client,
) => {
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
                        const retValA = await MemeController.AddEdge(memeA, memeB._id);
                        message.channel.send(`Added ${memeB.name} to ${retValA.name}'s edges.`);
                        const retValB = await MemeController.AddEdge(memeB, memeA._id);
                        message.channel.send(`Added ${memeA.name} to ${retValB.name}'s edges.`);
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
        case Command.Covid:
            // Generates a new botmessage with updated data (on the Github Actions *free* tier) every 6 hours using a
            // simple Python script. See: https://github.com/lucasjcm/janule-botmessage-covid
            fetch('https://raw.githubusercontent.com/lucasjcm/janule-botmessage-covid/master/botmessage.txt')
                .then((response) => {
                    return response.text();
                })
                .then((botmessage: string) => {
                    message.channel.send(botmessage);
                })
                .catch(() => {
                    const msg =
                        'An error happened and the issue has been logged somewhere (just in memory, and only ' +
                        'until it is garbage collected). Fuck you.';
                    message.channel.send(msg);
                });
            return;
        case Command.Vaxxed:
            // Generates a new botmessage with updated data (on the Github Actions *free* tier) every 6 hours using a
            // simple Python script. See: https://github.com/lucasjcm/janule-botmessage-vaxxed
            fetch('https://raw.githubusercontent.com/lucasjcm/janule-botmessage-vaxxed/master/botmessage.txt')
                .then((response) => {
                    return response.text();
                })
                .then((botmessage: string) => {
                    message.channel.send(botmessage);
                })
                .catch(() => {
                    const msg =
                        'An error happened and the issue has been logged somewhere (just in memory, and only ' +
                        'until it is garbage collected). Fuck you.';
                    message.channel.send(msg);
                });
            return;
        case Command.DeleteMeme:
            if (args.length > 0) {
                const memeToDeleteArg = args.join(' ');
                const memeToDelete = await MemeController.FindMeme(memeToDeleteArg);
                if (memeToDelete != null) {
                    memeToDelete.edges.map(async (edge) => {
                        let edgeMeme = await MemeController.GetMemeByID(edge);
                        await MemeController.RemoveEdge(edgeMeme, memeToDelete._id);
                    });
                    let deletionResponse = await MemeController.DeleteMemeByID(memeToDelete);
                    if (deletionResponse > 0) {
                        message.channel.send(`Deleted meme: ${memeToDelete}`);
                    }
                } else {
                    message.channel.send(`Could not find meme: ${memeToDeleteArg}`);
                }
            } else {
                message.channel.send(`Please supply a meme's name or ID to delete it.`);
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
        case Command.GetChannelStats:
            message.channel.send(`Getting statistics for ${message.channel.toString()}...this might take a while.`);
            await History.sendChannelStats(message, client);
            break;
        case Command.GetChannelURLs:
            message.channel.send(`Getting unique URLs for ${message.channel.toString()}...this might take a while.`);
            await History.sendChannelUniqueUrlsSummary(message);
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
        case Command.CleanMemes:
            const memes = await MemeController.GetMemes();
            memes.forEach(async (meme) => {
                let edges = meme.edges ?? [];
                if (edges.length > 0) {
                    console.log(`Evaluating meme ${meme.name} with ${meme.edges.length} edges.`);
                    const memeEdgeSet = new Set(edges);
                    const size = memeEdgeSet.size;
                    if (size != edges.length) {
                        edges = Array.from(memeEdgeSet);
                        await MemeController.SetEdges(meme, edges);
                    }
                    edges.forEach(async (edge) => {
                        const edgeMeme = await MemeController.GetMemesByID([edge]);
                        if (edgeMeme.length == 0 || edgeMeme[0] == null) {
                            console.log(`
                                Bad Edge on ${meme.name} - ${meme._id}.
                                Bad Edge is an edge to ${edge}
                                All edges: ${meme.edges}
                            `);
                            memeEdgeSet.delete(edge);
                        } else {
                            const edgeMemeResolved = edgeMeme[0];
                            const edgeMemeEdges = edgeMemeResolved.edges ?? [];
                            if (edgeMemeEdges.length === 0 || edgeMemeEdges.find((edge) => edge == meme._id) == null) {
                                console.log(
                                    `${edgeMemeResolved.name} needs an edge back to ${meme.name}.. adding now.`,
                                );
                                await MemeController.AddEdge(edgeMemeResolved, meme._id);
                            }
                        }
                        if (edge == meme._id) {
                            console.log(`Self referential meme: ${meme.name} - ${meme.id}`);
                            memeEdgeSet.delete(edge);
                        }
                        if (size != memeEdgeSet.size) {
                            console.log(`Corrected edges: ${{ ...memeEdgeSet }}`);
                            await MemeController.SetEdges(meme, Array.from(memeEdgeSet));
                        }
                    });
                }
            });

            break;
        case Command.GetMemesByID:
            if (args.length > 0) {
                const memes = await MemeController.GetMemesByID(args);
                const memeData: EmbedFieldData[] = memes.map((meme) => {
                    return {
                        name: meme.name,
                        value: `ID: ${meme._id} Edges: ${meme.edges}`,
                    };
                });
                message.channel.send(new Discord.MessageEmbed().addFields(memeData));
            } else {
                message.channel.send('Please specify ID(s) of meme(s) to get.');
            }

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
        case Command.RollJoint:
            const grams = Math.round(Math.random() * 50) / 10;
            const strain = await StrainController.RollStrain();
            message.channel.send(`${JOINT}Yo, here's a ${grams}g ${strain.strain} joint puff puff pass`);
            break;
        case Command.Stats:
            message.channel.send(`Running since: ${_STATS.startTime}`);
            break;
        case Command.Synth:
            let synthesis: string;
            let synthWithArgsResponse: SynthWithArgResponse | null = null;
            if (args.length > 0) {
                synthWithArgsResponse = await Synth.synthWithArg(args.join(' '));
                synthesis = synthWithArgsResponse.synthesis;
            } else {
                synthesis = await Synth.synth();
            }
            const flip = Math.floor(Math.random() * 2);
            const preface = flip == 1 ? 'How about: ' : 'Try this: ';
            const messageFieldData: EmbedFieldData[] = [{ name: synthesis, value: JANULE_SYNTHESIS }];
            if (synthWithArgsResponse !== null && synthWithArgsResponse.meme !== null) {
                messageFieldData.push(
                    { name: JANULE_SYNTHESIS_MEME_SEED, value: synthWithArgsResponse.meme._id, inline: false },
                    { name: 'Original Meme Name', value: synthWithArgsResponse.meme.name, inline: false },
                );
            }
            const synthMessageEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(preface)
                .addFields(messageFieldData);
            const synthesisMessage = await message.channel.send(synthMessageEmbed);
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
