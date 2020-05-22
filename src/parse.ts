export enum Command {
    AddMeme,
    GetMemes,
}

type Args = (string | number)[];

const COMMAND_STRING_PARSE_MAP = {
    '!addmeme': Command.AddMeme,
    '!getmemes': Command.GetMemes,
};

export const parseCommand = (message: string): { command?: Command; args?: Args } => {
    const [name, ...args] = message.split(' ');

    if (name in COMMAND_STRING_PARSE_MAP) {
        return { command: COMMAND_STRING_PARSE_MAP[name], args };
    }

    return {};
};
