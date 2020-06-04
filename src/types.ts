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
    Thanks,
    Synth,
}

export type Args = (string | number)[];

export type Models = {
    Janule: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
