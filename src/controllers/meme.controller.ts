import Meme, { IMeme } from '../models/meme.model';
import { IUser } from '../models/user.model';

interface ICreateMemeInput {
    name: IMeme['name'];
    creator: IUser['username'];
    edges: IMeme['edges'];
}

async function AddEdge(memeToUpdate: IMeme, edgeID: IMeme['_id']): Promise<IMeme> {
    return await Meme.findByIdAndUpdate(memeToUpdate['_id'], {
        $set: {
            edges: memeToUpdate['edges'].concat(edgeID),
        },
    }).then((document) => {
        return document;
    });
}

async function CreateMeme(meme: ICreateMemeInput): Promise<IMeme> {
    return Meme.create(meme)
        .then((data: IMeme) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

async function FindMemes(search: string): Promise<Array<IMeme>> {
    const regex = new RegExp(search);
    return await Meme.find({ $or: [{ name: regex }, { creator: regex }] }).limit(30);
}

async function GetMemes(): Promise<Array<IMeme>> {
    return await Meme.collection
        .aggregate([
            {
                $project: {
                    name: '$name',
                    creator: '$creator',
                    edges: '$edges',
                    edge_count: { $size: { $ifNull: ['$edges', []] } },
                },
            },
            { $sort: { edge_count: -1 } },
        ])
        .limit(30)
        .toArray()
        .then((documents) => {
            return documents;
        });
}

async function GetMemesByID(ids: Array<IMeme['_id']>): Promise<IMeme[]> {
    const results = ids.map(async (id) => {
        return await Meme.findById(id);
    });
    return await Promise.all(results).then((completed) => {
        return completed;
    });
}

async function DeleteMeme(meme: IMeme['name']): Promise<void> {
    await Meme.deleteOne({ name: meme })
        .then((data) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

async function RollMeme(): Promise<IMeme> {
    return await Meme.collection
        .aggregate([{ $sample: { size: 1 } }])
        .next()
        .then((documents) => {
            return documents;
        });
}

export default {
    AddEdge,
    CreateMeme,
    FindMemes,
    DeleteMeme,
    GetMemes,
    GetMemesByID,
    RollMeme,
};
