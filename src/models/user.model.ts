import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
}

const UserSchema: mongoose.Schema = new Schema({
    username: { type: String, requried: true, unique: true },
});

export default mongoose.model<IUser>('User', UserSchema);
