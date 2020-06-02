import { Args, Command } from './types';

const JANULE = '!janule';
const SHORT_JANULE = '!j';

export const COMMAND_STRING_PARSE_MAP = {
    addmeme: Command.AddMeme,
    addedge: Command.AddEdge,
    deletememe: Command.DeleteMeme,
    getmeme: Command.GetMeme,
    getmemes: Command.GetMemes,
    getusers: Command.GetUsers,
    help: Command.Help,
    roll: Command.Roll,
    rollmeme: Command.RollMeme,
};

export const parseCommand = (message: string): { command?: Command; args?: Args } => {
    const [janule, commandName, ...args] = message.split(' ');
    if ((janule == JANULE || janule == SHORT_JANULE) && commandName in COMMAND_STRING_PARSE_MAP) {
        return { command: COMMAND_STRING_PARSE_MAP[commandName], args };
    }

    return {};
};
