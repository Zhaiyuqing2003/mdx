import { Component, createEffect, createSignal, on, onMount } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import wow from './index.css'

import { mathCharFontMap } from './math/charProcessing/fontMap';
import { groupStringByFontMap, stringToNodeByFontMap } from './math/charProcessing/charMapper';
import { compute, computeFunctionMap, ctxTextMeasurer } from './math/computer/computer';
import { createNode, defaultParameterMap } from './math/creator/creator';
import { padding, position } from "./math/creator/util"
import { canvasDebugRendererMap, canvasRendererMap, getCanvasRenderer } from './math/renderer/canvasRenderer';
import { AlignDirection, ComputedMathNode, MathNode } from './math/types/type';
import { Align, Text, MathNodeType } from "./math/types/MathNodeType";
import { getSvgRenderer, svgDebugRendererMap, svgRendererMap } from './math/renderer/svgRenderer';
import { compiler } from './math/compiler/compilerOld';
import { executor } from './math/compiler/executor';
import { MacroEnv } from './math/compiler/macroEnv';
import { Lazy, Log, Repeat } from './math/compiler/macro/flow';



const App: Component = () => {
  let canvas: HTMLCanvasElement | undefined;
  let svg: SVGSVGElement | undefined;


// console.log(compiler(`
// $$name
//     tons of random shit
//     as long as you have correct indentation
//     nothing bad happens

// $$foo
//     $$bar
//         yes, fucking stacked macro is allowed
//     $$baz
//         and you can have two, the result are concatenated

// $$big $$small
//     yes, if you have just chain of macros, you can just put
//     them in one line, and they will be executed in order,
//     kind of sugar. this require all the macro except the last one
//     to only take one argument

// $$comment
//     yes, this is a function that do nothing

// $$something_cool
//     $$monad 123
//     $$comment yes now we can write this in one line, if they have only one argument
//         after some thinking, i think this is carefully united with the
//         chaining macro design.

// $$some_in_consideration
//     $$not_only_a_monad 123
//         it could have more!
//     $$command yes, this is somewhat need to be considered carefully
//         like every command, even if it's not monadic, it could put it's first
//         argument in the same line
//     $$first $$second $$third first param for third macro
//         second param for third macro
//         third param for third macro
//     $$command the previous one example could be rewritten as
//         $$foo $$bar yes, fucking stacked macro is allowed
//             $$baz and you can have two, the result are concatenated
//         while, this seemed kinda esoteric

// $$if 1
//     $$then $$display
//         this branch is called
//     $$else $$display
//         this branch is not called
//     $$then
//         even more
//     $$then
//         even more

// $$non-starting-macro-as-literals
//     you could just have $$123 as a literal, if it's not starting the line
//     and in this case, it's not a macro, it's just a literal

// $$wow 

// $$exec $$display $a $b 1
//     $$where
//         $a = 1
//         $b = 0`));
// console.log(compiler(`
// $$test 1 $$test 2 $$test 3
//   $$where`))

  const ast = compiler(`
$$define
  $$log 1
 1
`)

  console.log("ast is", ast)

  const macroEnv = MacroEnv.new();

  macroEnv.register("$$log", Log.transformer, Log.macroFn);
  macroEnv.register("$$lazy", Lazy.transformer, Lazy.macroFn);
  macroEnv.register("$$repeat", Repeat.transformer, Repeat.macroFn);

  const result = executor(ast, macroEnv, {});
  console.log(result)


  onMount(() => {
    const ctx = canvas!.getContext('2d')!;

    const textChildren = [
      createNode<Text>({
        type: Text,
        text: "ti",
        size: 100,
        styleFn: [(node) => {
          // const width = node.boundingBox.width;
          node.padding.left = 0.5 * node.boundingBox.width;
          node.padding.right = 0.5 * node.boundingBox.width;
          node.boundingBox.width *= 2;
        }]
      }),
      createNode({
        type: MathNodeType.Rect,
        width: 100,
        height: 1,
      }),
      // createNode({
      //   type : MathNodeType.Circle,
      //   radius: 100,
      // }),
      createNode({
        type: MathNodeType.Text,
        text: "b",
        size: 100
      })
    ]

    console.log(textChildren);

    const node = createNode<Align>({
      type: Align,
      children: textChildren,
      direction: AlignDirection.Column,
      padding: padding(10),
      styleFn: [(node) => {
        // const  { children, padding : { top, left, bottom, right }, boundingBox : { width, height } } = node;
        // const innerHeight = height - top - bottom;

        // for (const child of children) {
        //   child.boundingBox.y = (innerHeight - child.boundingBox.height + 100) / 2;
        // }

        // reAligner(node);
      }]
    })

    const AlignCenter = (node : MathNode<Align>) => {
      
    }

    // const 

    // console.log(node.toString());
    // node.children[0].padding.left = 100;`
    // console.log(node.children[0].padding.left);
    // console.log(node.children[1].padding.left);


    // console.log(groupStringByFontMap("123as123", mathCharFontMap))

    const computed = compute(node, computeFunctionMap, {
      textMeasurer: ctxTextMeasurer(ctx),  
    });
    console.log(computed);

    getCanvasRenderer(ctx, canvasDebugRendererMap)(computed, position.zero);
    getCanvasRenderer(ctx, canvasRendererMap)(computed, position.zero);

    getSvgRenderer(svg!, svgDebugRendererMap)(computed, position.zero)
    getSvgRenderer(svg!, svgRendererMap)(computed, position.zero)
  })

  return (<div style = {{
    display : 'flex'
  }}>
    <div>
      <svg ref = { svg } width = {400} height = {1000}></svg>
    </div>
    <canvas ref={canvas} width={400} height={2000} />
  </div>)
};






export default App;
