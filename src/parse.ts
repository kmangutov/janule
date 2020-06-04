import { Args, Command } from './types';

export const COMMAND_STRING_PARSE_MAP = {
    '!addmeme': Command.AddMeme,
    '!addedge': Command.AddEdge,
    '!deletememe': Command.DeleteMeme,
    '!getmeme': Command.GetMeme,
    '!getmemes': Command.GetMemes,
    '!getusers': Command.GetUsers,
    '!roll': Command.Roll,
    '!rollmeme': Command.RollMeme,
};

export const parseCommand = (message: string): { command?: Command; args?: Args } => {
    const [name, ...args] = message.split(' ');

    if (name in COMMAND_STRING_PARSE_MAP) {
        return { command: COMMAND_STRING_PARSE_MAP[name], args };
    }

    return {};
};
