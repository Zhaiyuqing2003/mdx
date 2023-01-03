import { MacroInfo } from "../compilerOld";
import { AstExecutorScoped, Macro, MacroFn, RunEnv, Transformer } from "../executor";

const id = <T>(x : T) => x;

export const Log = {
    transformer : id,
    macroFn : (val : any[]) => {
        val.forEach((x) => console.log(x))
        return [];
    }
}

export const Repeat : Macro = {
    transformer : id,
    macroFn : (args : any[], runEnv : RunEnv, astExecutor: AstExecutorScoped) => {
        const [times, ...rest] = args;
        // convert times to number
        const iteration = Number(times);
        if (Number.isNaN(iteration)) throw new Error("first argument of repeat should be a number");

        // rest should be a macro
        return Array(iteration).fill(0).flatMap(() => astExecutor(rest));
    }
}

const bindSelf = <T extends {[key : string] : any }>(obj : T) => {
    for (const key in obj) {
        if (typeof obj[key] === "function") {
            obj[key] = obj[key].bind(obj);
        }
    }

    return obj;
}

export const Lazy : Macro = bindSelf({
    ast : [],
    transformer(args) {
        (this.ast as (string | MacroInfo)[]) = args;
        return [];
    },
    macroFn() {
        return this.ast;
    }
})



