import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
}

const UserSchema: mongoose.Schema = new Schema({
    name: { type: String, requried: true, unique: true },
});

export default mongoose.model<IUser>('BorgeyesUsers', UserSchema, 'borgeyes_users');
