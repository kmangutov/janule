import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    AddEdge,
    DeleteMeme,
    GetMeme,
    GetMemes,
    GetUsers,
    Help,
    Roll,
    RollMeme,
    Stats,
    Synth,
    Thanks,
    Graph,
}

export enum Emojis {
    Approve,
    Reject,
}

export const EMOJI_IDENTIFIER_MAP = {
    '%E2%9C%85': Emojis.Approve,
    '%E2%9D%8C': Emojis.Reject,
};

export type Args = (string | number)[];

export type Models = {
    Janule: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
