import { MacroInfo, ErrorType } from "./compilerOld";
// import { Extern }

export type RunEnv = object;
export type Transformer = (args: (string | MacroInfo)[], runEnv: RunEnv) => (string | MacroInfo)[];
export type MacroFn = (
  args: any[], runEnv: RunEnv,
  astExecutor : AstExecutorScoped
) => any[];

export type Macro = {
  [key : string] : any,
  transformer: Transformer,
  macroFn: MacroFn,
}

export type AstExecutorScoped = (ast : (string | MacroInfo)[]) => any[];
export type AstExecutor = (ast : (string | MacroInfo)[], macroEnv : MacroEnvObject, runEnv : RunEnv) => any[];

export type MacroEnvObject = {
  register: (name: string | MacroInfo, transformer: Transformer, macroFn: MacroFn) => void,
  get: (name: string | MacroInfo) => Macro | undefined,
  getTransformer: (name: string | MacroInfo) => Transformer | undefined,
  getMacroFn: (name: string | MacroInfo) => MacroFn | undefined
}

export const executor : AstExecutor = (ast: (MacroInfo | string)[], macroObject: MacroEnvObject, runEnv: RunEnv) => {
  // using context: macroObject, runEnv
  const recursive : AstExecutorScoped = (ast: (MacroInfo | string)[]): any[] =>
    ast.flatMap((node) => {
      if (typeof node === "string") {
        return node;
      } else {
        const macro = macroObject.get(node);
        return macro === undefined
          ? ErrorType.MacroNotFound()
          : macro.macroFn(recursive(macro.transformer(node.arguments, runEnv)), runEnv, recursive);
      }
    })

  return recursive(ast);
}