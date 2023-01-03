import { ComputedMathNode, InnerBoundingBox } from "../types/type";
import { Align } from "../types/MathNodeType";

export const reAligner = (node : ComputedMathNode<Align>, recursive = false) => {
  const { children, padding : { top, left, right, bottom } } = node;

  if (recursive) {
    children.forEach((child) => {
      child.type === Align && reAligner(child, true);
    })
  }

  const {
    x, y, innerWidth, innerHeight
  } = getInnerBoundingBox(children);

  node.boundingBox = {
    x, y,
    innerWidth, innerHeight,
    width : innerWidth + left + right,
    height : innerHeight + top + bottom,
  }
}

export const getInnerBoundingBox = (children : readonly ComputedMathNode[]) : InnerBoundingBox => {
  const minLeft = min(children, (child) => child.boundingBox.x, 0);
  const minTop = min(children, (child) => child.boundingBox.y, 0);
  const maxRight = max(children, ({ boundingBox : { x, width }}) => x + width, 0);
  const maxBottom = max(children, ({ boundingBox : { y, height }}) => y + height, 0);

  return {
    x : minLeft,
    y : minTop,
    innerWidth : maxRight - minLeft,
    innerHeight : maxBottom - minTop,
  }
}

const max = <T>(array : readonly T[], fn : (item : T) => number, minimum : number) : number => {
  let max = minimum;
  for (const item of array) {
    max = Math.max(max, fn(item));
  }
  return max;
}

const min = <T>(array : readonly T[], fn : (item : T) => number, maximum : number) : number => {
  let min = maximum;
  for (const item of array) {
    min = Math.min(min, fn(item));
  }
  return min;
}
