// import { createEffect } from "solid-js"

import { createEffect, FlowComponent, VoidComponent } from "solid-js";

// export type MathElement = MathTextElement

// export type MathTextElement = {
//   text : string
// }

// export type MathTextElementComputed = {
//   boundingBox : {
//     x : number,
//     y : number,
//     width : number,
//     height : number
//   },
//   text : string
// }

// export type MathAlignElement = {
//   children : MathElement[]
// }

// export type PropsWithMathChildren<P = {}> = P & { children ?: string }
// export type MathComponent<P = {}> = (props : PropsWithMathChildren<P>) => MathElement

// export const MathText : MathComponent<MathTextElement> = (props) => {
//   createEffect(() => {
//     // console.log(props.text)
//   })

//   return props;
// }

// export const MathTextComputed : MathComponent<MathTextElementComputed> = (props) => {
//   return props;
// }

// export const ConfigAlign : ConfigComponent = (props) => {
//   const children = props.children ?? [];
//   return {
//     ...props,
//     children
//   };
// }

export const MathText : VoidComponent<{
  text : string
}> = (props) => {
  createEffect(() => {
    // console.log(props.text);
  })
  return {
    get text() {
      return props.text;
    }
  };
}