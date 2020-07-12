import Strain, { IStrain, CannabisSpecies } from '../models/strains.model';

async function AddStrain(strain: string, species: CannabisSpecies): Promise<IStrain> {
    const existing = await GetStrain(strain);
    if (existing != null) {
        return existing;
    }
    return await Strain.create({ strain, species })
        .then((data: IStrain) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

async function DeleteStrain(strain: string, species: CannabisSpecies): Promise<void> {
    await Strain.deleteOne({ strain, species })
        .then((data) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

async function GetStrain(strain: string): Promise<IStrain> {
    const regex = new RegExp(strain);
    return await Strain.findOne({ strain: regex });
}

async function RollStrain(): Promise<IStrain> {
    return await Strain.collection
        .aggregate([{ $sample: { size: 1 } }])
        .next()
        .then((documents) => {
            return documents;
        });
}

export default {
    AddStrain,
    DeleteStrain,
    GetStrain,
    RollStrain,
};
