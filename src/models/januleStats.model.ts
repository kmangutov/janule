import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IJanuleStats extends Document {
    thanksCount: number;
}

const JanuleStatsSchema: Schema = new Schema({
    thanksCount: { type: Number, required: true },
});

export default mongoose.model<IJanuleStats>('JanuleStats', JanuleStatsSchema, 'janule_stats');
