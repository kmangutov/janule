import * as Discord from 'discord.js';
import * as immutable from 'immutable';

import { EMOJI_IDENTIFIER_MAP, Emojis } from './types';

async function reactApproveRejectEmojis(message: Discord.Message): Promise<void> {
    const emojiMap = immutable.Map(EMOJI_IDENTIFIER_MAP);
    const approve = emojiMap.findKey((value: Emojis) => value == Emojis.Approve);
    const reject = emojiMap.findKey((value: Emojis) => value == Emojis.Reject);
    message.react(approve);
    message.react(reject);
}

export default {
    reactApproveRejectEmojis,
};
