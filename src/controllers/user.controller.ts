import User, { IUser } from '../models/user.model';

interface ICreateUserInput {
    username: IUser['username'];
}

async function CreateUser({ username }: ICreateUserInput): Promise<IUser> {
    return User.create({
        username,
    })
        .then((data: IUser) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

export default {
    CreateUser,
};
