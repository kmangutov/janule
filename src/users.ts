import { Models } from './types';

export class Users {
    userModel: Models['Users'];
    constructor(model: Models['Users']) {
        this.userModel = model;
    }

    async getUIDForDiscordName(discordName: string): Promise<string> {
        const uid = await this.userModel
            .find({
                name: discordName,
            })
            .exec();
        if (uid != undefined && uid.length > 0) {
            return uid[0]._id;
        }
        return null;
    }

    async addUser(discordName: string): Promise<void> {
        this.userModel.collection.insertOne({
            name: discordName,
        });
    }
}
