import { Component, onMount, JSX, createRoot, createEffect, children, FlowComponent } from "solid-js"

export const CanvasRender : FlowComponent<{
  width : number,
  height : number
}> = (props) => {
  let canvas : HTMLCanvasElement | undefined;

  // createRoot(props.children);

  // const resolved = children(() => props.children)

  onMount(() => {
    // console.log(props.children!())
    // props.children!()
  })

  createEffect(() => {

    const ctx = canvas!.getContext("2d")!;

    // console.log(c().text);
    console.log(props.children()!.text)

    // console.log(props)

    // if (props.children) {
    //   ctx.font = "italic 50px Latex Math";

    //   console.log(props.children.text)

    //   const metrics = ctx.measureText(props.children.text);
    //   const {
    //       actualBoundingBoxAscent,
    //       actualBoundingBoxDescent,
    //       actualBoundingBoxLeft,
    //       actualBoundingBoxRight,
    //   } = metrics;

    //   ctx.fillText(
    //     props.children.text, 
    //     0 + metrics.actualBoundingBoxLeft,
    //     0 + metrics.actualBoundingBoxAscent
    //   );
    // }


  })



  return (<canvas
    ref = { canvas } 
    width = { props.width } 
    height = { props.height } 
  />)
}