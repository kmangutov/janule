import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { handleCommand } from './command';
import { parseCommand } from './parse';

import { dbUrl, dbToken } from '../secrets.json';

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

const MemeScheme = new mongoose.Schema({
    name: String,
});
const Meme = mongoose.model('Meme', MemeScheme, 'memes');
const PersonScheme = new mongoose.Schema({
    username: String,
});
const Users = mongoose.model('JanuleUsers', PersonScheme, 'janule_users');

client.on('message', async (message: Discord.Message) => {
    if (!isDbConnected) {
        return;
    }

    const models = {
        Meme: Meme,
        Users: Users,
    };

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

    handleCommand(command, args, username, message, models);
});
