import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    AddEdge,
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
}

export type Args = (string | number)[];

export type Models = {
    Janule: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
