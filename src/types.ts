import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    AddEdge,
    Covid,
    AddStrain,
    DeleteMeme,
    DeleteStrain,
    FindStrain,
    GetMeme,
    GetMemes,
    GetUsers,
    Help,
    Roll,
    RollJoint,
    RollMeme,
    Stats,
    Synth,
    Thanks,
    Graph,
    Process,
}

export enum Emojis {
    Approve,
    Reject,
}

export const EMOJI_IDENTIFIER_MAP = {
    '%E2%9C%85': Emojis.Approve,
    '%E2%9D%8C': Emojis.Reject,
};

export const BORGEYES_SYNTHESIS = 'borgeyes-synthesis';

export type Args = (string | number)[];

export type Models = {
    Borgeyes: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
