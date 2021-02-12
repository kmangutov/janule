import MemeController from './controllers/meme.controller';
import { IMeme } from './models/meme.model';

export type SynthWithArgResponse = {
    meme: IMeme;
    synthesis: string;
};
async function synth(): Promise<string> {
    const [randomMemeA, randomMemeB] = await Promise.all([MemeController.RollMeme(), MemeController.RollMeme()]);
    const memeAName = randomMemeA.name;
    const memeBName = randomMemeB.name;
    return `${memeAName.substr(0, memeAName.length / 2)}${memeBName.substr(memeBName.length / 2)}`;
}

async function synthWithArg(arg: string): Promise<SynthWithArgResponse> {
    const randomSynthMeme = await MemeController.RollMeme();
    let foundMemes = await MemeController.FindMemes(arg);
    let randomIdx: number;
    let foundMeme: IMeme | null = null;
    if (foundMemes.length == 0) {
        foundMemes = [await MemeController.RollMeme()];
        randomIdx = 0;
    } else {
        const pendingMemeEdges = foundMemes.map(async (meme) => {
            return await MemeController.GetMemesByID(meme.edges);
        });
        const memeEdges2D = await Promise.all(pendingMemeEdges);
        foundMemes = foundMemes.concat(memeEdges2D.flat());
        randomIdx = Math.floor(foundMemes.length * Math.random());
        foundMeme = foundMemes[randomIdx];
    }
    return { meme: foundMeme, synthesis: `${foundMemes[randomIdx].name} ${randomSynthMeme.name}` };
}

export default {
    synth,
    synthWithArg,
};
