import { getInnerBoundingBox } from "./computeAuxiliary";
import { position } from "../creator/util";
import { AlignDirection, ComputedMathNode, MathNode, Position, TextStyleNode } from "../types/type";
import { Align, Circle, MathNodeType, Rect, Text } from "../types/MathNodeType";

export type ComputeConfig = {
  textMeasurer : TextMeasurer,
}

export type ComputeInternalConfig = ComputeConfig & {
  computeFn : <T extends MathNodeType>(
    node : Readonly<MathNode<T>>,
    position : Readonly<Position>
  ) => ComputedMathNode<T>
}

export type ComputeFunction = <T extends MathNodeType>(
  node : Readonly<MathNode<T>>,
  position : Readonly<Position>
) => ComputedMathNode<T>

export type ComputeInternal = <T extends MathNodeType>(
  node : Readonly<MathNode<T>>,
  computeMap : Readonly<ComputeFunctionMap>,
  position : Readonly<Position>,
  computeConfig : Readonly<ComputeConfig>
) => ComputedMathNode<T>;

export type TextMeasurer = (text : string, style : TextStyleNode) => TextMetrics

type ComputeAlignMap = {
  [K in AlignDirection] : (
    node : Readonly<MathNode<Align>>,
    position : Readonly<Position>,
    computeConfig : Readonly<ComputeInternalConfig>
  ) => ComputedMathNode<Align>
}

type ComputeFunctionMap = {
  [K in MathNodeType] : (
    node : Readonly<MathNode<K>>,
    position : Readonly<Position>,
    computeConfig : Readonly<ComputeInternalConfig>
  ) => ComputedMathNode<K>
}

export const compute = (
  node : Readonly<MathNode<MathNodeType>>,
  computeMap : Readonly<ComputeFunctionMap>,
  config : Readonly<ComputeConfig>
) => {
  return computeInternal(node, computeMap, position.zero, config);
}

export const ctxTextMeasurer = (
  ctx : CanvasRenderingContext2D,
) : TextMeasurer => {
  return (text, {
    size, font, style
  }) => {
    ctx.save();

    ctx.font = `${style} ${size}px ${font}`;
    const metrics = ctx.measureText(text);

    ctx.restore();

    return metrics;
  }
}

// export const createSelector = (node : Readonly<ComputedMathNode>) : Selector => {
//   const map = idParser<ComputedMathNode>(node);

//   return (id : string) => map.get(id);
// }

const computeInternal : ComputeInternal = <T extends MathNodeType>(
  node : Readonly<MathNode<T>>,
  computeMap : ComputeFunctionMap,
  position : Readonly<Position>,
  computeConfig : Readonly<ComputeConfig>
) : ComputedMathNode<T> => {
  const type : T = node.type;

  const computeFn : ComputeFunction = <U extends MathNodeType>(
    node : Readonly<MathNode<U>>, 
    position : Readonly<Position>
  ) => {
    return computeInternal(node, computeMap, position, computeConfig)
  }
  return computeMap[type](node, position, {
    computeFn,
    ...computeConfig
  });
};

export const computeFunctionMap : ComputeFunctionMap = {
  [Align] : (node, position, computeConfig) => {
    const computedNode = computeAlignMap[node.direction](node, position, computeConfig);
    
    return computedNode;
  },
  [Text] : (node, { x, y }, { textMeasurer }) => {
    const metrics = textMeasurer(node.text, node);
    const {
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
      actualBoundingBoxLeft,
      actualBoundingBoxRight,
    } = metrics;
  
    const padding = node.padding;
  
    const computedNode : ComputedMathNode<Text> = {
      type: Text,
      boundingBox : {
        x, y,
        innerWidth : actualBoundingBoxRight + actualBoundingBoxLeft,
        innerHeight : actualBoundingBoxAscent + actualBoundingBoxDescent,
        width : actualBoundingBoxRight + actualBoundingBoxLeft + padding.left + padding.right,
        height : actualBoundingBoxAscent + actualBoundingBoxDescent + padding.top + padding.bottom,
      },
      padding,
      textMetrics : metrics,
      text : node.text,
      size : node.size,
      font : node.font,
      style : node.style,
      color : node.color,
      textColor : node.textColor
    }

    node.styleFn.forEach((fn) => {
      fn(computedNode);
    })

    return computedNode;
  },
  [Rect] : (node, position) => {
    const padding = node.padding;

    console.log(node.width, node.height)

    const computedNode : ComputedMathNode<Rect> = {
      type: Rect,
      boundingBox : {
        x : position.x,
        y : position.y,
        innerWidth : node.width,
        innerHeight : node.height,
        width : node.width + padding.left + padding.right,
        height : node.height + padding.top + padding.bottom,
      },
      padding,
      color : node.color
    }

    node.styleFn.forEach((fn) => {
      fn(computedNode);
    })

    return computedNode;
  },
  [Circle] : (node, position) => {
    const padding = node.padding;
  
    const computedNode : ComputedMathNode<Circle> = {
      type: Circle,
      boundingBox : {
        x : position.x,
        y : position.y,
        innerHeight : node.radius * 2,
        innerWidth : node.radius * 2,
        width : node.radius * 2 + padding.left + padding.right,
        height : node.radius * 2 + padding.top + padding.bottom,
      },
      padding,
      radius : node.radius,
      color : node.color
    }

    node.styleFn.forEach((fn) => {
      fn(computedNode);
    })

    return computedNode;
  },
};

export const computeAlignMap : ComputeAlignMap = {
  [AlignDirection.Row](
    node, position, {
      computeFn   
    }
  ) {
    const { children, padding } = node;

    let left = 0;

    const computedChildren = children.map((child) => {
      const computedChild = computeFn(child, {
        x : left,
        y : 0,
      });
      left += computedChild.boundingBox.width;
      return computedChild;
    })

    const {
      x, y, innerWidth, innerHeight
    } = getInnerBoundingBox(computedChildren);

    const computedNode : ComputedMathNode<Align> = {
      type : MathNodeType.Align,
      boundingBox : {
        x, y,
        innerWidth,
        innerHeight,
        width : innerWidth + padding.left + padding.right,
        height : innerHeight + padding.top + padding.bottom,
      },
      children : computedChildren,
      direction : node.direction,
      color : node.color,
      padding
    }

    node.styleFn.forEach((fn) => {
      fn(computedNode)
    })

    return computedNode; 
  },
  [AlignDirection.Column](
    node, position, {
      computeFn
    }
  ) {
    const { children, padding } = node;

    let top = 0;

    const computedChildren = children.map((child) => {
      const computedChild = computeFn(child, {
        x : 0,
        y : top,
      });
      top += computedChild.boundingBox.height;
      return computedChild;
    })

    const {
      x, y, innerWidth, innerHeight
    } = getInnerBoundingBox(computedChildren);


    const computedNode : ComputedMathNode<Align> = {
      type : MathNodeType.Align,
      boundingBox : {
        x, y,
        width : innerWidth + padding.left + padding.right,
        height : innerHeight + padding.top + padding.bottom,
        innerWidth,
        innerHeight,
      },
      children : computedChildren,
      direction : node.direction,
      color : node.color,
      padding
    }

    node.styleFn.forEach((fn) => {
      fn(computedNode)
    })

    return computedNode;
  }
}


// const sum = <T>(array : readonly T[], fn : (item : T) => number) : number => {
//   let sum = 0;
//   for (const item of array) {
//     sum += fn(item);
//   }
//   return sum;
// }