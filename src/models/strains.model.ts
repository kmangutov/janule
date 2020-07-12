import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

export enum CannabisSpecies {
    Hybrid = 'Hybrid',
    Indica = 'Indica',
    Sativa = 'Sativa',
}

export const CANNABIS_SPECIES_PARSE_MAP = {
    h: CannabisSpecies.Hybrid,
    hybrid: CannabisSpecies.Hybrid,
    i: CannabisSpecies.Indica,
    indica: CannabisSpecies.Indica,
    s: CannabisSpecies.Sativa,
    sativa: CannabisSpecies.Sativa,
};

export interface IStrain extends Document {
    strain: string;
    species: CannabisSpecies;
}

const StrainSchema = new Schema({
    strain: { type: String, required: true },
    species: { type: String, requried: true },
});

export default mongoose.model<IStrain>('Strain', StrainSchema);
