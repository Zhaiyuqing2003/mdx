import { MacroInfo } from "./compilerOld";
import { MacroEnvObject, Macro, MacroFn, Transformer } from "./executor";

type TypedObject<T> = { [key: string] : T };

export class MacroEnv {
    private env : TypedObject<Macro> = {};
    private constructor() {}
    static new() : MacroEnvObject {
        return new MacroEnv();
    }

    private getMacroName(value : string | MacroInfo) {
        return typeof value === "string" ? value : value.name;
    }

    get(key : string | MacroInfo) : Macro | undefined {
        return this.env[this.getMacroName(key)];
    }

    getTransformer(val : string | MacroInfo) {
        return this.get(val)?.transformer
    }

    getMacroFn(val : string | MacroInfo) {
        return this.get(val)?.macroFn
    }

    has(val : string) {
        return this.env.hasOwnProperty(val);
    }

    register(val : string | MacroInfo, transformer : Transformer, macroFn : MacroFn) {
        this.env[this.getMacroName(val)] = {
            transformer,
            macroFn
        };
    }
}

