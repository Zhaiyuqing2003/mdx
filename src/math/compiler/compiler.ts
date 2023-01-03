export enum TokenType {
  Extern = "extern",
  Text = "text",
  Line = "line",
  Indent = "indent"
}

export type Token = ExternToken | TextToken | IndentToken | LineToken

export type ExternToken = {
  type: TokenType.Extern,
  name: string
}

export type TextToken = {
  type: TokenType.Text,
  text: string
}

export type IndentToken = {
  type: TokenType.Indent,
  length: number
}

export type LineToken = {
  type: TokenType.Line
}

export type Extern = {
  name: string,
  argument: (string | Extern)[]
}

type ExternInfo = {
  extern: Extern,
  indent: number,
  parameterIndent: number
}

const keys = Object.keys as <T extends object>(o: T) => (keyof T)[];
const newExtern = (name: string): Extern => ({ name, argument: [] });
const newExternInfo = (extern : Extern, indent : number, parameterIndent : number): ExternInfo => ({
  extern, indent, parameterIndent
});

class Stack<T> {
  private readonly stack: T[] = [];
  private readonly notFoundError: () => never;
  private constructor(notFoundError : () => never) { this.notFoundError = notFoundError }
  static new<T>(notFoundError : () => never) { return new Stack<T>(notFoundError) }
  push(item: T) { this.stack.push(item) }
  pop() { return this.stack.pop() ?? this.notFoundError() }
  peek() { return this.stack[this.stack.length - 1] ?? this.notFoundError() }
  isEmpty() { return this.stack.length === 0 }
  size() { return this.stack.length }
}

enum LineState {
  Text, // prev is text
  Extern,  // prev is extern
  Initial,
  BlockInitial,
  Indent, // prev is a indent after a initial line
  BlockIndent, // prev is a indent after a block initial line
}

enum ErrorType {
  invalidToken,
  doubleIndent,
  indentAfterText,
  indentAfterExtern,

  parentExternNotFound,

  textStartWithZeroIndent,
  noExternMatchIndent,
}

enum WarningType {
  whiteSpaceText,
  lineWithOnlyIndent,
  blockStartingLineWithOnlyIndent,
}

enum NoteType {
  emptyLine,
}

export const Compiler = class {
  private readonly externFnChar: string;
  private readonly tokenRegex: RegExp;

  private static readonly ErrorMap = {
    [ErrorType.invalidToken]: "[Tokenizer Error] Invalid token",
    [ErrorType.doubleIndent]: "[Tokenizer Error] Double indent in a line",
    [ErrorType.indentAfterText]: "[Tokenizer Error] Indent after text",
    [ErrorType.indentAfterExtern]: "[Tokenizer Error] Indent after extern",

    [ErrorType.parentExternNotFound]: "[Parser Error] Parent extern function not found",

    [ErrorType.textStartWithZeroIndent]: "[Syntax Error] Text start with zero indent",
    [ErrorType.noExternMatchIndent]: "[Syntax Error] No extern match indent",
  } as const;

  private static readonly WarningMap = {
    [WarningType.whiteSpaceText]: "[Syntax Warning] Text contains only whitespace",
    [WarningType.lineWithOnlyIndent]: "[Syntax Warning] Line contains only indent",
    [WarningType.blockStartingLineWithOnlyIndent]: "[Syntax Warning] Block starting line contains only indent",
  } as const;

  private static readonly NoteMap = {
    [NoteType.emptyLine]: "[Syntax Note] Empty line",
  }

  private static Error(type: ErrorType) : never {
    throw new Error(Compiler.ErrorMap[type]);
  }
  private static Warning(type: WarningType) {
    console.warn(Compiler.WarningMap[type]);
  }
  private static Note(type: NoteType) {
    console.info(Compiler.NoteMap[type]);
  }

  private static tokenMapper = (group: Record<any, string>): Record<TokenType, Token> => ({
    extern: { type: TokenType.Extern, name: group.extern! },
    line: { type: TokenType.Line },
    indent: { type: TokenType.Indent, length: group.indent!.length },
    text: { type: TokenType.Text, text: group.text! }
  })

  private constructor(externFnChar: string, tokenRegex: RegExp) {
    this.externFnChar = externFnChar;
    this.tokenRegex = tokenRegex;
  }

  static new(char: string = "$") {
    return new Compiler(char, new RegExp(
      `(?<extern>\\${char}\\${char}\S+)|` +
      `(?<line>\n|\r\n)|` +
      `(?<indent>^[^\S\n\r]+)|` +
      `(?<text>.+?(?=(?:\\${char}\\${char}\w+|$)))`,
      "gm"));
  }

  tokenize(str: string): Token[] {
    return [...str.matchAll(this.tokenRegex)].map(({ groups }) => {
      const mapper = Compiler.tokenMapper(groups!);
      const key = keys(mapper).find((key) => groups![key] !== undefined)
        ?? Compiler.Error(ErrorType.invalidToken)
      return mapper[key];
    })
  }

  parse(tokens: Token[]) {
    const externStack: Stack<ExternInfo> = Stack.new(() => Compiler.Error(ErrorType.parentExternNotFound));
    let lineState = LineState.Initial as LineState;
    const ast: Extern[] = [];

    const peekParentIndent = () => externStack.peek().indent;
    const peekParentParameterIndent = () => externStack.peek().parameterIndent;

    const setParentParameterIndent = (indent: number) => 
      externStack.peek().parameterIndent = indent;

    const addToParentLastArgument = (arg: string) => {
      const parentArguments = externStack.peek().extern.argument;
      parentArguments[parentArguments.length - 1] += arg;
    }

    const addParentArgument = (arg: string | Extern) => 
      externStack.peek().extern.argument.push(arg);

    const pushExternStack = (extern: Extern, indent: number, parameterIndent : number) =>
      externStack.push(newExternInfo(extern, indent, parameterIndent));
    
    const automaton = {
      [TokenType.Extern] : {
        [LineState.Text] : (token : ExternToken) => {
          addToParentLastArgument(token.name);
          return [true, LineState.Text] as const;
        },
        [LineState.Extern] : (token : ExternToken) => {
          const child = newExtern(token.name);

          addParentArgument(child);
          // the new indent has the same value of the parent indent
          pushExternStack(child, peekParentIndent(), Infinity)
          return [true, LineState.Extern] as const;
        },
        // [line_start, extern] <-- have 0 indent
        [LineState.Initial] : () => [false, LineState.BlockInitial] as const,
        [LineState.BlockInitial] : (token : ExternToken) => {
          const extern = newExtern(token.name);
          ast.push(extern);

          pushExternStack(extern, 0, Infinity)
          return [true, LineState.Extern] as const;
        },
        [LineState.Indent] : () => [false, LineState.BlockIndent] as const,
        [LineState.BlockIndent] : (token : ExternToken) => {
          const child = newExtern(token.name);

          addParentArgument(child);

          // the new indent is the parameter indent of the parent extern
          pushExternStack(child, peekParentIndent(), Infinity)
          return [true, LineState.Extern] as const;
        }
      },
      [TokenType.Text] : {
        // (text, extern literal, text) pattern
        [LineState.Text] : (token : TextToken) => {
          addToParentLastArgument(token.text);
          return [true, LineState.Text] as const;
        },
        // (extern, text) <- text as parameter
        [LineState.Extern] : (token : TextToken) => {
          token.text.trim() === "" 
            ? Compiler.Warning(WarningType.whiteSpaceText)
            : addParentArgument(token.text);
          return [true, LineState.Extern] as const;
        },
        // text can never start with zero indent
        [LineState.Initial] : Compiler.Error(ErrorType.textStartWithZeroIndent),
        [LineState.BlockInitial] : Compiler.Error(ErrorType.textStartWithZeroIndent),
        // (indent, text) <- text as parameter
        [LineState.Indent] : () => [false, LineState.BlockIndent] as const,
        [LineState.BlockIndent] : (token : TextToken) => {
          addParentArgument(token.text);
          return [true, LineState.Text] as const;
        }
      },
      [TokenType.Indent] : {
        [LineState.Text] : Compiler.Error(ErrorType.indentAfterText),
        [LineState.Extern] : Compiler.Error(ErrorType.indentAfterExtern),
        [LineState.Indent] : Compiler.Error(ErrorType.doubleIndent),
        [LineState.BlockIndent] : Compiler.Error(ErrorType.doubleIndent),
        [LineState.Initial] : (token : IndentToken) => {
          // (line_start, indent) <-- parameter indication for the extern that have same indent
          while (peekParentParameterIndent() > token.length) {
            externStack.pop();
          }

          if (peekParentParameterIndent() < token.length) 
            Compiler.Error(ErrorType.noExternMatchIndent);

          externStack.pop()
          return [true, LineState.Indent] as const;
        },
        [LineState.BlockInitial] : (token : IndentToken) => {
          // extern
          // indent <-- is that for the above extern
          if (peekParentIndent() < token.length) {
            // initialize the parameter indent for the extern
            setParentParameterIndent(token.length);
            return [true, LineState.BlockIndent] as const;
          }
          // for the previous extern
          while (peekParentParameterIndent() > token.length) {
            externStack.pop();
          }

          if (peekParentParameterIndent() < token.length) 
            Compiler.Error(ErrorType.noExternMatchIndent);

          externStack.pop()
          return [true, LineState.Indent] as const;
        }
      },
      [TokenType.Line] : {
        // reset line state
        [LineState.Text] : () => [true, LineState.Initial] as const,
        [LineState.Extern] : () => [true, LineState.BlockInitial] as const,
        // some warning
        [LineState.Indent] : () => {
          Compiler.Warning(WarningType.lineWithOnlyIndent);
          return [true, LineState.Initial] as const;
        },
        [LineState.BlockIndent] : () => {
          Compiler.Warning(WarningType.blockStartingLineWithOnlyIndent);
          return [true, LineState.BlockInitial] as const;
        },
        [LineState.Initial] : () => {
          Compiler.Note(NoteType.emptyLine);
          return [true, LineState.Initial] as const;
        },
        [LineState.BlockInitial] : () => {
          Compiler.Note(NoteType.emptyLine);
          return [true, LineState.BlockInitial] as const;
        }
      }
    } as const;

    let index = 0;
    while (index < tokens.length) {
      const token = tokens[index]!;
      const [isConsumed, nextState] = automaton[token.type][lineState](token as any);
      if (isConsumed) index++;
      lineState = nextState;
    }

    return ast;
  }
}
