import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    DeleteMeme,
    GetMeme,
    GetMemes,
    GetUsers,
    Roll,
}

export type Args = (string | number)[];

export type Models = {
    Meme: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
