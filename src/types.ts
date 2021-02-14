import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    AddEdge,
    AddStrain,
    CleanMemes,
    Covid,
    DeleteMeme,
    DeleteStrain,
    FindStrain,
    GetChannelStats,
    GetChannelURLs,
    GetMeme,
    GetMemesByID,
    GetUsers,
    Graph,
    Help,
    Roll,
    RollJoint,
    RollMeme,
    Stats,
    Synth,
    Thanks,
    Vaxxed,
}

export enum Emojis {
    Approve,
    Reject,
}

export const EMOJI_IDENTIFIER_MAP = {
    '%E2%9C%85': Emojis.Approve,
    '%E2%9D%8C': Emojis.Reject,
};

export const MOST_COMMON_WORDS = [
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'I',
    'i',
    'is',
    'its',
    'are',
    'your',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
    'so',
    'up',
    'out',
    'if',
    'about',
    'who',
    'get',
    'which',
    'go',
    'me',
    'when',
    'make',
    'can',
    'like',
    'time',
    'no',
    'just',
    'a',
    'u',
    '!j',
    '!janule',
    'was',
    'im',
];

export const JANULE_SYNTHESIS = 'janule-synthesis';
export const JANULE_SYNTHESIS_MEME_SEED = 'janule-synthesis-meme-seed';

export type Args = (string | number)[];

export type Models = {
    Janule: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
