import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export interface IBorgeyesStats extends Document {
    thanksCount: number;
}

const BorgeyesStatsSchema: Schema = new Schema({
    thanksCount: { type: Number, required: true },
});

export default mongoose.model<IBorgeyesStats>('BorgeyesStats', BorgeyesStatsSchema, 'borgeyes_stats');
