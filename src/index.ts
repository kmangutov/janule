import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { dbUrl, dbToken } from '../secrets.json';

import { parseCommand, Command } from './parse';

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

client.on('message', (message: any) => {
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
                Users.collection.insert([
                    {
                        name: username,
                    },
                ]);
            }
        }
    });
    const { command, args } = parseCommand(message.content);

    switch (command) {
        default:
            // If the message doesn't parse into a command, it is ignored.
            return;
        case Command.AddMeme:
            Meme.collection.insert([
                {
                    name: args[0],
                    creator: username,
                },
            ]);
            break;
        case Command.GetMemes:
            const memes = Meme.collection.find();
            memes.toArray().then((documents) => {
                const results = documents.map((value, index) => {
                    const creator = value.creator != undefined ? value.creator : 'Unknown';
                    return index + ': ' + value.name + ' \n Created By: ' + creator;
                });
                message.channel.send('Current Memes: \n' + results.join('\n'));
            });
            break;
        case Command.Roll:
            const result = Math.floor(Math.random() * Number(args[0]));
            message.channel.send(`Rolled a ${result}`);
            break;
    }
});
