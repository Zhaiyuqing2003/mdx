// parse tokens into ast
export type MacroInfo = {
  name: string,
  arguments: (string | MacroInfo)[]
}

export enum TokenType {
  Macro = 'macro',
  Line = "line",
  Indent = "indent",
  Text = "text",
}

type Token = ({
  type: TokenType.Macro,
  macroName: string,
} | {
  type: TokenType.Line,
} | {
  type: TokenType.Indent,
  length: number,
} | {
  type: TokenType.Text,
  text: string,
})

export const ErrorType = {
  DoubleIndent() { throw new Error("double indent on single line, tokenizer error") },
  IndentAfterText() { throw new Error("indent after text, tokenizer error") },
  IndentAfterMacro() { throw new Error("indent after macro, tokenizer error") },
  TextStartWithZeroIndent() { throw new Error("current line have text but starting with zero indent, which make it impossible to be an parameter of a macro, syntax error") },
  PrevMacroUndefined() { throw new Error("previous macro is undefined, parser error") },
  NoMacrosMatchIndent() { throw new Error("no macros matches current indent, syntax error") },
  MacroNotFound() { throw new Error("macro not found, executor error") },
} as const;

export const WarningType = {
  LineWithOnlyIndent() { 
    console.warn("empty line with only indent should be avoided") 
  },
  BlockStartingLineWithOnlyIndent() {
    console.warn(
      "block starting line should be avoided generally, " +
      "the compiler will ignore the current indentation set by this line " +
      "and this might cause confusion"
    );
  },
  TextWithOnlySpace() {
    console.warn("text with only space will not be considered as a parameter for the macro");
  }
} as const;

export const NoteType = {
  EmptyLine() { console.log("avoid empty line, it's not necessary") }
} as const;

export const compiler = (str: string) => {
  const tokens = tokenizer(str);
  const ast = parser(tokens);

  return ast;
}

const newMacroInfo = (name : string) : MacroInfo => {
  return { name, arguments : [] }
}

const parser = (tokens: Token[]) => {
  type ParameterIndent = number;
  type Indent = number;
  type MacroUnion = {
    macroInfo : MacroInfo,
    indent : Indent,
    parameterIndent : ParameterIndent
  }

  enum LineState {
    BlockInitial, Initial, InitialIndent, BlockInitialIndent, Text, Macro
  }

  const ParameterInitialIndent = Infinity;
  const InitialIndent = 0;

  let lineState = LineState.Initial;
  let macroStack: MacroUnion[] = [];

  // const require_prev_macro_exist = () => (macroStack.length > 0) || ErrorType.prev_macro_undefined();

  const prevMacroUnion = () => (macroStack.length > 0)
      ? macroStack[macroStack.length - 1]!
      : ErrorType.PrevMacroUndefined();

  const ast: MacroInfo[] = [];

  for (const [index, token] of tokens.entries()) {
    if (token.type === TokenType.Macro) {
      if (lineState === LineState.Text) { // this macro is considered to be a literal
        // last macro should exist for the text must have last_macro to be placed
        const macroArguments = prevMacroUnion().macroInfo.arguments;
        macroArguments[macroArguments.length - 1] += token.macroName;

        lineState = LineState.Text;
        continue;
      }
      if (lineState === LineState.Initial ||
          lineState === LineState.BlockInitial) {
        const macro = newMacroInfo(token.macroName);
        ast.push(macro);
        // empty the stack, and push the new macro
        macroStack = [{
          macroInfo: macro,
          indent: InitialIndent,
          parameterIndent: ParameterInitialIndent
        }];

        lineState = LineState.Macro;
        continue;
      }

      // note the initial_indent / block_initial_indent & macro have different indent settings
      if (lineState === LineState.Macro) { // last macro exists as the state is macro

        const macro = newMacroInfo(token.macroName);
        const prevMacro = prevMacroUnion();
        prevMacro.macroInfo.arguments.push(macro);

        // push the new macro
        // follow the same indent as the previous macro
        macroStack.push({
          macroInfo: macro,
          indent: prevMacro.indent,
          parameterIndent: ParameterInitialIndent
        });

        lineState = LineState.Macro;
        continue;
      }

      // the indent token already solve the param apply problem,
      // as well as guaranteed that prev_macro exist
      if (lineState === LineState.InitialIndent ||
          lineState === LineState.BlockInitialIndent) {

        const macro = newMacroInfo(token.macroName);
        const prevMacro = prevMacroUnion();
        prevMacro.macroInfo.arguments.push(macro);

        // push the new macro
        // this is different than above, follow the indent of current line
        macroStack.push({
          macroInfo: macro,
          indent: prevMacro.parameterIndent,
          parameterIndent: ParameterInitialIndent
        });

        lineState = LineState.Macro;
        continue;
      }
    } else if (token.type === TokenType.Text) {
      // the indent is checked when indent is processed, so it is not checked here

      // initial auto failed is because text could never have zero indent
      if (lineState === LineState.Initial) ErrorType.TextStartWithZeroIndent();
      if (lineState === LineState.BlockInitial) ErrorType.TextStartWithZeroIndent();
      // these four case doesn't check existence of last_macro because it's checked when indent is processed
      if (lineState === LineState.Text) {
        // this is actually the case when text macro_literal text occurs, so we basically
        // append the text to the last param
        // the last param should be a string.
        const macroArguments = prevMacroUnion().macroInfo.arguments;
        macroArguments[macroArguments.length - 1] += token.text;
        lineState = LineState.Text;
        continue;
      }
      if (lineState === LineState.InitialIndent ||
          lineState === LineState.BlockInitialIndent) { // this line is a param that is text, pass it to the macro
        // pass into macro
        prevMacroUnion().macroInfo.arguments.push(token.text);
        lineState = LineState.Text;
        continue;
      }
      if (lineState === LineState.Macro) { 
        // pass this param into macro
        // this is the case that text is written in the same line as macro
        // check if the text itself is empty string

        token.text.trim() !== ""
          ? prevMacroUnion().macroInfo.arguments.push(token.text)
          : WarningType.TextWithOnlySpace();
        // this is in the same line as the macro, keep the macro state
        lineState = LineState.Macro;
        continue;
      }
    } else if (token.type === TokenType.Indent) {
      if (lineState === LineState.InitialIndent) ErrorType.DoubleIndent();
      if (lineState === LineState.BlockInitialIndent) ErrorType.DoubleIndent();
      if (lineState === LineState.Text) ErrorType.IndentAfterText();
      if (lineState === LineState.Macro) ErrorType.IndentAfterMacro();
      // only indent after initial / block initial state shall pass
      if (lineState === LineState.BlockInitial) {
        // the previous macro should be defined, because only with macro can we have block initial
        if (token.length > prevMacroUnion().indent) { // this is the case that the param is for the prev macro
          // update the current block param indent
          prevMacroUnion().parameterIndent = token.length;
          lineState = LineState.BlockInitialIndent;
          continue;
        } else { // this is the case that param is actually for the macro that is in the stack
          // this is the same as the case of LineState.initial
          // let it process by the next if statement
          lineState = LineState.Initial;
        }
      }
      if (lineState === LineState.Initial) {
        const index = macroStack.findIndex(({ parameterIndent }) => parameterIndent === token.length);
        if (index === -1) ErrorType.NoMacrosMatchIndent();

        // pop all the macro after the index
        macroStack = macroStack.slice(0, index + 1);

        // this is the case that the indent match the macro
        lineState = LineState.InitialIndent;
        continue;
      }
    } else if (token.type === TokenType.Line) {
      // some note / warning here
      if (lineState === LineState.Initial ||
          lineState === LineState.BlockInitial) {
        NoteType.EmptyLine();
        continue;
      }

      // reset the line state
      if (lineState === LineState.InitialIndent) {
        WarningType.LineWithOnlyIndent();
        lineState = LineState.Initial;
        continue;
      }
      if (lineState === LineState.BlockInitialIndent) {
        WarningType.BlockStartingLineWithOnlyIndent();
        lineState = LineState.BlockInitial;

        prevMacroUnion().parameterIndent = ParameterInitialIndent;
        continue;
      }

      // reset the line state
      if (lineState === LineState.Macro) {
        lineState = LineState.BlockInitial;
        continue;
      }
      if (lineState === LineState.Text) {
        lineState = LineState.Initial;
        continue;
      }
    }
  }

  return ast;
}

const tokenizer = (str: string): Token[] => {
  const regex = /(?<macro>\$\$\S+)|(?<line>\n|\r\n)|(?<indent>^[^\S\n\r]+)|(?<text>.+?(?=(?:\$\$\w+|$)))/gm;
  const tokens = str.matchAll(regex);

  return [...tokens].map((token) => {
    const group = token.groups!;
    if (group.macro !== undefined) {
      return { type: TokenType.Macro, macroName: group.macro };
    } else if (group.line !== undefined) {
      return { type: TokenType.Line };
    } else if (group.indent !== undefined) {
      return { type: TokenType.Indent, length: group.indent.length };
    } else if (group.text !== undefined) {
      return { type: TokenType.Text, text: group.text };
    }
    throw new Error("invalid token");
  });
}