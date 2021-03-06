import * as mongoose from 'mongoose';
import Meme, { IMeme } from '../models/meme.model';
import { IUser } from '../models/user.model';

interface ICreateMemeInput {
    name: IMeme['name'];
    creator: IUser['name'];
    edges: IMeme['edges'];
}

async function AddEdge(memeToUpdate: IMeme, edgeID: IMeme['_id']): Promise<IMeme> {
    const memeToUpdateUniqueEdges = new Set(memeToUpdate['edges']);
    memeToUpdateUniqueEdges.add(edgeID);
    return await Meme.findByIdAndUpdate(memeToUpdate['_id'], {
        $set: {
            edges: Array.from(memeToUpdateUniqueEdges),
        },
    }).then((document) => {
        return document;
    });
}

async function SetEdges(memeToUpdate: IMeme, edges: Array<IMeme['_id']>): Promise<IMeme> {
    return await Meme.findByIdAndUpdate(memeToUpdate['_id'], {
        $set: {
            edges: Array.from(new Set(edges)),
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

async function FindMeme(search: string): Promise<IMeme | null> {
    let maybeMeme = await FindMemeByName(search);
    if (maybeMeme == null) {
        maybeMeme = await FindMemeByID(search);
    }
    return maybeMeme;
}

async function FindMemeByName(search: string): Promise<IMeme | null> {
    const maybeMeme = await Meme.find({ name: search });
    if (maybeMeme.length > 0) {
        return maybeMeme[0];
    } else {
        return null;
    }
}

async function FindMemeByID(search: string): Promise<IMeme | null> {
    if (mongoose.Types.ObjectId.isValid(search)) {
        const maybeMeme = await Meme.find({ _id: search });
        if (maybeMeme.length > 0) {
            return maybeMeme[0];
        }
    }
    return null;
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
        .toArray()
        .then((documents) => {
            return documents;
        });
}

async function GetMemeByID(id: IMeme['_id']): Promise<IMeme | null> {
    return await Meme.findById(id);
}

async function GetMemesByID(ids: Array<IMeme['_id']>): Promise<IMeme[]> {
    const results = ids.map(async (id) => {
        return await Meme.findById(id);
    });
    return await Promise.all(results).then((completed) => {
        return completed;
    });
}

async function DeleteMemeByID(id: IMeme['_id']): Promise<number> {
    const deleteStatus = await Meme.deleteOne({ _id: id })
        .then((data) => {
            return data.ok !== null ? data.ok : -1;
        })
        .catch((error: Error) => {
            throw error;
        });
    return deleteStatus;
}

async function DeleteMemeByName(meme: IMeme['name']): Promise<number> {
    const deleteStatus = await Meme.deleteOne({ name: meme })
        .then((data) => {
            return data.ok !== null ? data.ok : -1;
        })
        .catch((error: Error) => {
            throw error;
        });
    return deleteStatus;
}

async function RollMeme(): Promise<IMeme> {
    return await Meme.collection
        .aggregate([{ $sample: { size: 1 } }])
        .next()
        .then((documents) => {
            return documents;
        });
}

async function RemoveEdge(meme: IMeme, edgeToRemove: IMeme['_id']): Promise<IMeme> {
    return await Meme.findByIdAndUpdate(meme._id, {
        $set: {
            edges: Array.from(meme.edges.filter((edge) => edge != edgeToRemove)),
        },
    });
}

export default {
    AddEdge,
    CreateMeme,
    FindMeme,
    FindMemes,
    DeleteMemeByName,
    DeleteMemeByID,
    GetMemeByID,
    GetMemes,
    GetMemesByID,
    RemoveEdge,
    RollMeme,
    SetEdges,
};
