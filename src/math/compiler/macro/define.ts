import { MacroInfo } from "../compilerOld";
import { AstExecutorScoped, Macro, MacroFn, RunEnv, Transformer } from "../executor";

// first looks like $frac $a $b

const define = (str : string) => {
    // find the first equal sign
    const eq = str.indexOf('=')
    if (eq === -1) ErrorType.NoEqualSign();
    const [first, second] = [str.slice(0, eq), str.slice(eq + 1)];

    const reg = /(?<param>\$[^\s\$]+)|(?<literal>\S)/g
    // split the first part into tokens
    const token = [...first.matchAll(reg)]

    token.forEach((x) => {
        // if both param and literal are undefined or both are defined, throw error
        if (x.groups?.param === undefined && x.groups?.literal === undefined) {
            ErrorType.InvalidToken();
        }

        if (x.groups?.param !== undefined && x.groups?.literal !== undefined) {
            ErrorType.InvalidToken();
        }
    })

    if (token.length === 0) ErrorType.NoMacroName();

    // if the first token is a literal, throw error
    if (token[0]?.groups?.literal !== undefined) ErrorType.FirstTokenIsLiteral();

    // pattern match the second part
    
}

export const Define : Macro = {
    transformer : <T>(x : T) => x,
    macroFn : (args : any[], runEnv : RunEnv, astExecutor: AstExecutorScoped) => {
        // args should all be string, toString them and concat them
        define(args.map((x) => x.toString()).join(''));

        return [];
    }
}


const ErrorType = {
    NoEqualSign() { throw new Error("No equal sign found in define") },
    NoMacroName() { throw new Error("No macro name found in define") },
    InvalidToken() { throw new Error("Invalid token found in define, possibly internal error") },
    FirstTokenIsLiteral() { throw new Error("First token is literal, should be the macro name") },
}