import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { handleCommand } from './command';
import { parseCommand } from './parse';
import { webServer } from './server';

import { dbUrl, dbToken } from '../secrets.json';

import { Users } from './users';
import Meme from './models/meme.model';

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

const PersonScheme = new mongoose.Schema({
    username: String,
});
const UserModel = mongoose.model('JanuleUsers', PersonScheme, 'janule_users');

const JanuleStatsSchema = new mongoose.Schema({
    thanksCount: Number,
});
const JanuleModel = mongoose.model('JanuleStats', JanuleStatsSchema, 'janule_stats');

const models = {
    Janule: JanuleModel,
    Users: UserModel,
    Memes: Meme,
};

const users = new Users(UserModel);

client.on('message', async (message: Discord.Message) => {
    if (!isDbConnected) {
        return;
    }

    const username = message.author.username + '#' + message.author.discriminator;

    let uid = await users.getUIDForDiscordName(username);
    if (uid == null) {
        await users.addUser(username);
        uid = await users.getUIDForDiscordName(username);
    }

    console.info('Message received from %s, UID: %s.', username, uid);

    const { command, args } = parseCommand(message.content);

    handleCommand(command, args, username, message, models);
});

webServer();
