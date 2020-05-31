import { Args, Command } from './types';

const COMMAND_STRING_PARSE_MAP = {
    '!addmeme': Command.AddMeme,
    '!deletememe': Command.DeleteMeme,
    '!getmeme': Command.GetMeme,
    '!getmemes': Command.GetMemes,
    '!getusers': Command.GetUsers,
    '!roll': Command.Roll,
};

export const parseCommand = (message: string): { command?: Command; args?: Args } => {
    const [name, ...args] = message.split(' ');

    if (name in COMMAND_STRING_PARSE_MAP) {
        return { command: COMMAND_STRING_PARSE_MAP[name], args };
    }

    return {};
};
