import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IMeme extends Document {
    name: string;
    creator: IUser['username'];
    edges: Array<string>;
}

const MemeSchema: Schema = new Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true },
    edges: { type: [String], requried: true },
});

export default mongoose.model<IMeme>('Meme', MemeSchema);
