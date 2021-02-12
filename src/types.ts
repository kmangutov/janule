import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    AddEdge,
    AddStrain,
    Covid,
    DeleteMeme,
    DeleteStrain,
    FindStrain,
    GetChannelStats,
    GetChannelURLs,
    GetMeme,
    GetMemes,
    GetUsers,
    Graph,
    Help,
    Roll,
    RollJoint,
    RollMeme,
    Stats,
    Synth,
    Thanks,
}

export enum Emojis {
    Approve,
    Reject,
}

export const EMOJI_IDENTIFIER_MAP = {
    '%E2%9C%85': Emojis.Approve,
    '%E2%9D%8C': Emojis.Reject,
};

export const JANULE_SYNTHESIS = 'janule-synthesis';

export type Args = (string | number)[];

export type Models = {
    Janule: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
