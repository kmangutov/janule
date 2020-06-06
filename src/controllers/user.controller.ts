import User, { IUser } from '../models/user.model';

interface ICreateUserInput {
    name: IUser['name'];
}

async function CreateUser({ name }: ICreateUserInput): Promise<IUser> {
    return User.create({
        name,
    })
        .then((data: IUser) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

async function getUIDForDiscordName(discordName: string): Promise<string> {
    const uid = await User.find({
        name: discordName,
    }).exec();
    if (uid != undefined && uid.length > 0) {
        return uid[0]._id;
    }
    return null;
}

async function getUsers(): Promise<IUser[]> {
    return await User.find({}).exec();
}

export default {
    CreateUser,
    getUIDForDiscordName,
    getUsers,
};
