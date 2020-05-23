import * as mongoose from 'mongoose';

export enum Command {
    AddMeme,
    GetMemes,
    Roll,
}

export type Args = (string | number)[];

export type Models = {
    Meme: mongoose.Model<mongoose.Document, {}>;
    Users: mongoose.Model<mongoose.Document, {}>;
};
