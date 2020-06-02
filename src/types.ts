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
}

export type Args = (string | number)[];

export type Models = {
    Meme: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
