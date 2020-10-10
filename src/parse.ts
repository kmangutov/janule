import { Args, Command } from './types';

const BORGEYES = '!borgeyes';
const SHORT_BORGEYES = '!b';

export const COMMAND_STRING_PARSE_MAP = {
    // addmeme: Command.AddMeme,
    // addedge: Command.AddEdge,
    // covid: Command.Covid,
    // addstrain: Command.AddStrain,
    // deletememe: Command.DeleteMeme,
    // deletestrain: Command.DeleteStrain,
    // findstrain: Command.FindStrain,
    // getmeme: Command.GetMeme,
    // getmemes: Command.GetMemes,
    // getusers: Command.GetUsers,
    // help: Command.Help,
    // roll: Command.Roll,
    // rolljoint: Command.RollJoint,
    // rollmeme: Command.RollMeme,
    // thx: Command.Thanks,
    // thanks: Command.Thanks,
    // stats: Command.Stats,
    // synth: Command.Synth,
    // graph: Command.Graph,
    process: Command.Process,
};

export const parseCommand = (message: string): { command?: Command; args?: Args } => {
    const [borgeyes, commandName, ...args] = message.split(' ');
    if ((borgeyes == BORGEYES || borgeyes == SHORT_BORGEYES) && commandName in COMMAND_STRING_PARSE_MAP) {
        return { command: COMMAND_STRING_PARSE_MAP[commandName], args };
    }

    return {};
};
