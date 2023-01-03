// export const svgRendererMap : SvgRendererMap = {

import { AnyObject, ComputedMathNode, Position } from "../types/type"
import { Align, Circle, MathNodeType, Rect, Text } from "../types/MathNodeType";

export const getSvgRenderer = (
  svg: SVGSVGElement,
  rendererMap: SvgRendererMap,
) => {
  const scoped = <T extends MathNodeType>(
    parent : SVG,
    node: Readonly<ComputedMathNode<T>>,
    position: Position
  ) => {
    rendererMap[node.type](
      parent, node, position, scoped
    );
  }

  return <T extends MathNodeType>(
    node : Readonly<ComputedMathNode<T>>, 
    position : Position
  ) => {
    const root = SVG.wrap(svg);
    scoped(root, node, position);
    root.appendAll();
  }
}

export const svgRendererMap : SvgRendererMap = {
  [Align] : (
    parent, {
      boundingBox,
      children,
      padding : { left, top }
    }, shift, renderFn
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    const group = SVG.create("g").attr({
      transform: `translate(${x}, ${y})`,
    })

    parent.waitAppend(group);

    children.forEach(child => {
      renderFn(group, child, {
        x : left,
        y : top
      });
    })
  },
  [Text] : (
    parent, {
      boundingBox,
      padding : { left, top },
      textMetrics : {
        actualBoundingBoxAscent,
        actualBoundingBoxLeft
      },
      style, size, font, text, textColor, color
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    parent.waitAppend(SVG
      .create("text")
      .attr({
        x : x + left + actualBoundingBoxLeft,
        y : y + top + actualBoundingBoxAscent,
        style : `font: ${style} ${size}px ${font}`,
        fill : textColor,
        // make it unable to select
        "pointer-events" : "none",
      })
      .text(text)
    );
  },
  [Rect] : (
    parent, {
      boundingBox,
      boundingBox : { innerWidth, innerHeight },
      padding : { left, top }, 
      color
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    parent.waitAppend(SVG
      .create("rect")
      .attr({
        x : x + left,
        y : y + top,
        width : innerWidth,
        height : innerHeight,
        fill : color,
      })
    )
  },
  [Circle] : (
    parent, {
      boundingBox,
      padding : { left, top },
      color,
      radius
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    parent.waitAppend(SVG
      .create("circle")
      .attr({
        cx : x + left + radius,
        cy : y + top + radius,
        r : radius,
        fill : color,
      })
    )
  }
}

export const svgDebugRendererMap : SvgRendererMap = {
  [Align] : (
    parent, {
      boundingBox,
      boundingBox : { innerWidth, innerHeight, width, height },
      children,
      padding : { left, top }
    }, shift, renderFn
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    const group = SVG.create("g").attr({
      transform: `translate(${x}, ${y})`,
    })

    parent.waitAppend(SVG.create("rect")
      .attr({
        x, y, width, height,
        fill : rgba(0, 0, 255, 0.15),
        stroke : rgba(255, 0, 0, 0.5),
        strokeWidth : 1
      })
    ).waitAppend(SVG.create("rect")
      .attr({
        x : x + left,
        y : y + top,
        width : innerWidth,
        height : innerHeight,
        fill : rgba(0, 0, 255, 0.15),
      })
    ).waitAppend(group)

    children.forEach(child => {
      renderFn(group, child, {
        x : left,
        y : top
      });
    })
  },
  [Text] : (
    parent, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight },
      padding : { left, top },
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    parent.waitAppend(SVG // fill the padding and outline the bounding box
      .create("rect")
      .attr({
        x, y, width, height,
        fill : rgba(0, 0, 255, 0.15),
        stroke : "black",
        "stroke-width" : 1
      })
    ).waitAppend(SVG // fill the inner part
      .create("rect")
      .attr({
        x : x + left,
        y : y + top,
        width : innerWidth,
        height : innerHeight,
        fill : rgba(0, 255, 0, 0.15),
      })
    )
  },
  [Rect] : (
    parent, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight },
      padding : { left, top },
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;
    
    // outline the bounding box
    parent.waitAppend(SVG // fill the padding and outline the bounding box
      .create("rect")
      .attr({
        x, y, width, height,
        fill : rgba(0, 0, 255, 0.15),
        stroke : "black",
        "stroke-width" : 1
      })
    ).waitAppend(SVG // fill the inner part
      .create("rect")
      .attr({
        x : x + left,
        y : y + top,
        width : innerWidth,
        height : innerHeight,
        fill : rgba(0, 255, 0, 0.15),
      })
    )
  },
  [Circle] : (
    parent, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight },
      padding : { left, top },
    }, shift
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    // outline the bounding box
    parent.waitAppend(SVG // fill the padding and outline the bounding box
      .create("rect")
      .attr({
        x, y, width, height,
        fill : rgba(0, 0, 255, 0.15),
        stroke : "black",
        "stroke-width" : 1
      })
    ).waitAppend(SVG // fill the inner part
      .create("rect")
      .attr({
        x : x + left,
        y : y + top,
        width : innerWidth,
        height : innerHeight,
        fill : rgba(0, 255, 0, 0.15),
      })
    )
  }
}


class SVG {
  private constructor(private elem : SVGElement, private appendList : SVG[]) {}
  public static create(name : string) : SVG {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", name);
    return new SVG(elem, []);
  }
  public static wrap(elem : SVGElement) : SVG {
    return new SVG(elem, []);
  }
  public attr(attr : AnyObject) : SVG {
    for (const key in attr) {
      this.elem.setAttribute(key, attr[key].toString());
    }
    return this;
  }
  public text(text : string) : SVG {
    this.elem.textContent = text;
    return this;
  }
  public unwrap() : SVGElement {
    return this.elem;
  }
  // public append(child : SVG) : SVG {
  //   this.elem.appendChild(child.unwrap());
  //   return this;
  // }
  public waitAppend(child : SVG) : SVG {
    this.appendList.push(child);
    return this;
  }
  public appendAll() : SVG {
    this.appendList.forEach(elem => {
      this.elem.appendChild(elem.appendAll().unwrap());
    });
    return this;
  }
}

const rgba = (r : number, g : number, b : number, a : number) : string => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export type SvgRendererScoped = <T extends MathNodeType>(
  parent : SVG,
  node: Readonly<ComputedMathNode<T>>,
  position: Position,
) => void;

export type SvgRendererMap = {
  [K in MathNodeType]: SvgRendererFunction<K>
}

export type SvgRendererFunction<T extends MathNodeType> = (
  parent: SVG,
  node: Readonly<ComputedMathNode<T>>,
  shift: Position,
  renderFn: SvgRendererScoped | never
) => void;