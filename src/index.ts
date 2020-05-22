import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { dbUrl, dbToken } from '../secrets.json';

import { parseCommand, Command } from './parse';

const DISCORD_NAME_REGEX = /(.*)#(\d{4})/g;

const client = new Discord.Client();
client.login(dbToken);

let isDbConnected = false;

mongoose
    .connect(dbUrl, { useNewUrlParser: true })
    .then(() => {
        isDbConnected = true;
        return console.info(`Successfully connected to ${dbUrl}`);
    })
    .catch((error) => {
        console.error('Error connecting to database: ', error);
        return process.exit(1);
    });

console.info('WELCOME TO JANULE .. BOT.. HI');

let MemeScheme = new mongoose.Schema({
    name: String,
});
let Meme = mongoose.model('Meme', MemeScheme, 'memes');
let PersonScheme = new mongoose.Schema({
    username: String,
});
let Users = mongoose.model('JanuleUsers', PersonScheme, 'janule_users');

client.on('message', async (message: any) => {
    if (!isDbConnected) {
        return;
    }

    const username = message.author.username + '#' + message.author.discriminator;
    Users.find({
        name: username,
    }).exec(function (err, docs) {
        if (err != null) {
            console.log(err);
        } else {
            if (Array.isArray(docs) && docs.length == 0) {
                Users.collection.insertOne({
                    name: username,
                });
            }
        }
    });
    const { command, args } = parseCommand(message.content);

    switch (command) {
        default:
            // If the message doesn't parse into a command, it is ignored.
            return;
        case Command.AddMeme:
            await Meme.collection.insertOne({
                name: args[0],
                creator: username,
            });
            break;
        case Command.GetMemes:
            let memes = Meme.collection.find();
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
                message.channel.send('Current Memes: \n' + resultStrings.join('\n'));
            });
            break;
        case Command.Roll:
            const result = Math.floor(Math.random() * Number(args[0])) + 1;
            message.channel.send(`Rolled a ${result === 56 ? 'janule' : result}`);
            break;
    }
});
