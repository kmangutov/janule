import * as Discord from 'discord.js';
import * as getUrls from 'get-urls';
import { COMMAND_STRING_PARSE_MAP } from '../parse';
import { MOST_COMMON_WORDS } from '../types';

/**
 * Get all the messages from a channel. Discord's MessageManager API allows us to get 100
 * messages at a time.
 * @param messageManager
 */
async function getChannelMessages(messageManager: Discord.MessageManager) {
    let allMessages: Array<Discord.Message> = [];
    let messages = await messageManager.fetch({ limit: 100 });
    let messageArray = messages.array();
    allMessages = allMessages.concat(messageArray);
    let size = messageArray.length;
    let message = messageArray[size - 1];
    let idx = message.id;
    while (size > 0) {
        messages = await messageManager.fetch({ limit: 100, before: idx });
        messageArray = messages.array();
        size = messageArray.length;
        if (size > 0) {
            allMessages = allMessages.concat(messageArray);
            idx = messageArray[size - 1].id;
        }
    }
    return allMessages;
}
/**
 * Send a message with all the unique URLs of the channel for the given message @param.
 * @param message
 */
async function sendChannelUniqueUrlsSummary(message: Discord.Message) {
    const messages = await getChannelMessages(message.channel.messages);
    let urls: Set<string> = new Set();
    messages.map((message) => getUrls(message.content).forEach((url) => urls.add(url)));
    const urlStrings: Array<string> = [];
    urls.forEach((url) => urlStrings.push(url));
    message.channel.send('```' + urlStrings.join('\n') + '```');
}

/**
 * Send a message embed with statistics about the channel for the given message @param
 * @param incomingMessage
 */
async function sendChannelStats(incomingMessage: Discord.Message, client: Discord.Client) {
    let messages = await getChannelMessages(incomingMessage.channel.messages);
    if (messages.length > 0) {
        const botUser = client.user.username + '#' + client.user.discriminator;
        // Sort the messages by increasing timestamp
        messages.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp);

        // Get the first message with content.length > 0
        let firstMessageWithNonEmptyContentIdx = 0;
        while (messages[firstMessageWithNonEmptyContentIdx].content.length === 0) {
            firstMessageWithNonEmptyContentIdx++;
        }
        const firstMessage = messages[firstMessageWithNonEmptyContentIdx];
        const firstMessageUser = `${firstMessage.author.username}#${firstMessage.author.discriminator} said : ${firstMessage.content}`;

        let channelMessageStats: Map<string, number> = new Map();
        let channelWordStats: Map<string, number> = new Map();

        // Map over all the messages and bump a message count for each user.
        messages.map((message) => {
            const user = `${message.author.username}#${message.author.discriminator}`;
            const userStats = channelMessageStats.get(user) ?? 0;
            channelMessageStats.set(user, userStats + 1);

            // Get a count of each word for non-bot messages
            if (user != botUser) {
                message.content.split(' ').map((word) => {
                    if (!(word in MOST_COMMON_WORDS || word in COMMAND_STRING_PARSE_MAP)) {
                        const wordCount = channelWordStats.get(word) ?? 0;
                        channelWordStats.set(word, wordCount + 1);
                    }
                });
            }
        });
        // Sort channelMessageStats by descending message count
        channelMessageStats = sortMapByNumericalValueDescending(channelMessageStats);
        channelWordStats = sortMapByNumericalValueDescending(channelWordStats);

        const channelMessageStatsArray = [];
        const channelWordStatsArray = [];

        channelMessageStats.forEach((numMessages, user) => channelMessageStatsArray.push(`${user}: ${numMessages}`));
        const words = Array.from(channelWordStats.keys());
        for (let i = 0; i < 5; i++) {
            channelWordStatsArray.push(`${words[i]}: ${channelWordStats.get(words[i])}`);
        }

        const messageEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Channel Statistics:')
            .addFields([
                {
                    name: 'Number of messages sent by user:',
                    value: channelMessageStatsArray.join('\n'),
                },
                {
                    name: 'Number of messages:',
                    value: messages.length,
                },
                {
                    name: 'Top 5 words:',
                    value: channelWordStatsArray.join('\n'),
                },
                {
                    name: 'First Message (text):',
                    value: firstMessageUser,
                },
            ]);
        incomingMessage.channel.send(messageEmbed);
    } else {
        incomingMessage.channel.send('Could not find messages for this channel');
    }
}

function sortMapByNumericalValueDescending(map: Map<string, number>): Map<string, number> {
    return new Map<string, number>([...map].sort((a, b) => b[1] - a[1]));
}

export default {
    sendChannelStats,
    sendChannelUniqueUrlsSummary,
};
