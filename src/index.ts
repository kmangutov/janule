import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';

import { handleCommand } from './command';
import { parseCommand } from './parse';

import { dbUrl, dbToken } from '../secrets.json';

import UserController from './controllers/user.controller';

export const _STATS = {
    startTime: new Date(),
};

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

client.on('message', async (message: Discord.Message) => {
    if (!isDbConnected) {
        return;
    }

    const username = message.author.username + '#' + message.author.discriminator;

    let uid = await UserController.getUIDForDiscordName(username);
    if (uid == null) {
        await UserController.CreateUser({ name: username });
        uid = await UserController.getUIDForDiscordName(username);
    }

    console.info('Message received from %s, UID: %s.', username, uid);

    const { command, args } = parseCommand(message.content);

    handleCommand(command, args, username, message);
});
