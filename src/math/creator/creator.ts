import { FontType } from "../charProcessing/fontMap"
import { 
  DefaultMathNodeParameterMap, 
  OptionalMathNode, 
  MathNode, 
  AlignDirection} from "../types/type"
import { MathNodeType, Text, Rect, Circle, Align } from "../types/MathNodeType"
import { padding, color, combine } from "./util"

export const defaultParameterMap : DefaultMathNodeParameterMap = {
  get [Text]() {
    return {
      padding : padding.zero,
      color : color.black,
      textColor : color.black,
      size : 16,
      font : FontType.Main,
      style : "normal",
      styleFn : [],
      data : {}
    }
  },
  get [Rect]() {
    return {
      color : color.black,
      padding : padding.zero,
      styleFn : [],
      data : {}
    }
  },
  get [Circle]() {
    return {
      color : color.black,
      padding : padding.zero,
      styleFn : [],
      data : {}
    }
  },
  get [Align]() {
    return {
      children : [],
      direction : AlignDirection.Row,
      color : color.black,
      padding : padding.zero,
      styleFn : [],
      data : {}
    }
  }
} as const;

export const createNode = <T extends MathNodeType>(
  parameter : OptionalMathNode<T>
) : MathNode<T> => {
  return combine(defaultParameterMap[parameter.type], parameter)
}


