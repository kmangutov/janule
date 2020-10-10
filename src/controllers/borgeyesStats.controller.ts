import BorgeyesStats, { IBorgeyesStats } from '../models/borgeyesStats.model';

async function ThankBorgeyes(): Promise<IBorgeyesStats> {
    const stats = await BorgeyesStats.findOne({});
    return await BorgeyesStats.findOneAndUpdate(
        { thanksCount: stats.thanksCount },
        { $set: { thanksCount: stats.thanksCount + 1 } },
        { new: true },
    );
}

export default {
    ThankBorgeyes,
};
