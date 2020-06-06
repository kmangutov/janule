import JanuleStats, { IJanuleStats } from '../models/januleStats.model';

async function ThankJanule(): Promise<IJanuleStats> {
    const stats = await JanuleStats.findOne({});
    return await JanuleStats.findOneAndUpdate(
        { thanksCount: stats.thanksCount },
        { $set: { thanksCount: stats.thanksCount + 1 } },
        { new: true },
    );
}

export default {
    ThankJanule,
};
