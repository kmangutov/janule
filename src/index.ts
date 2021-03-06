import * as Discord from 'discord.js';
import * as mongoose from 'mongoose';
import * as log from 'log-to-file';

import { handleCommand } from './command';
import { parseCommand } from './parse';
import Reactions from './reactions';

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

client.on('messageReactionAdd', async (reaction: Discord.MessageReaction, user: Discord.User) => {
    Reactions.handleReaction(reaction, user, client);
});

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

    const messageMetadata = `Message received from ${username}, UID: ${uid}.`;
    console.info(messageMetadata);
    log(messageMetadata, 'messages.log');

    const { command, args } = parseCommand(message.content);

    handleCommand(command, args, username, message, client);
});
