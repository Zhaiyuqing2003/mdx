import { MathNodeParameterMap, ComputedMathNodeParameterMap } from "./ParameterMap";
import { MathNodeType } from "./MathNodeType";
import { OptionalKeys } from "./util";

type MathNodeMap = {
  [K in MathNodeType]: object;
}

export type TypeKeyMap<T extends object> = {
  [K in keyof T] : T[K] & {
    type : K,
  }
}

export type AlignFnMap<T extends object> = {
  [K in keyof T] : T[K] & (
    K extends MathNodeType 
      ? {
        styleFn ?: StyleFunction<K>[]
      }
      : never
  )
}

export type ParameterMap<R extends MathNodeMap, O extends MathNodeMap> = {
  optional : {
    [K in (keyof R & keyof O)] : R[K] & Partial<O[K]>
  }
  default : {
    [K in keyof R] : {
      [P in OptionalKeys<R[K]>] : Exclude<R[K][P], undefined>
    }
  }
}

export type Padding = {
  top : number;
  right : number;
  bottom : number;
  left : number;
}

export type Color = string;
export type TextFont = string;
export type TextStyle = string;
export type TextSize = number;
export enum AlignDirection {
  Row = "row",
  Column = "column"
}
export type StyleFunction<T extends MathNodeType = MathNodeType> = (node : ComputedMathNode<T>) => void
export type Selector = (id : string) => ComputedMathNode | undefined;



export type Position = {
  x : number;
  y : number;
}
export type BoundingBox = {
  x : number;
  y : number;
  innerWidth : number;
  innerHeight : number;
  width : number;
  height : number;
}
export type InnerBoundingBox = {
  x : number;
  y : number;
  innerWidth : number;
  innerHeight : number;
}
export type OuterBoundingBox = {
  x : number;
  y : number;
  width : number;
  height : number;
}
export type TextStyleNode = {
  font : TextFont;
  style : TextStyle;
  size : TextSize;
}
export type AnyObject = { [key : string] : Object };

enum MetricType {
  Pixel, PercentHeight, PercentWidth, Em, ParentPercentHeight, ParentPercentWidth 
}

export enum AlignType {
  Start, Center, End
}

type MetricMap = {
  [key in MetricType] : MetricFunction
}

type MetricFunction = (node : any, value : number) => number;

type AdaptiveMetric = {
  [key in MetricType] ?: MetricFunction;
};

export type AdaptivePadding = {
  left : AdaptiveMetric;
  right : AdaptiveMetric;
  top : AdaptiveMetric;
  bottom : AdaptiveMetric;
}

// paddings
// alignments



export type DefaultMathNodeParameterMap = MathNodeParameterMap["default"];
export type OptionalMathNodeParameterMap = MathNodeParameterMap["optional"];
 
export type OptionalMathNode<T extends MathNodeType = MathNodeType> = OptionalMathNodeParameterMap[T];
export type DefaultMathNode<T extends MathNodeType = MathNodeType> = DefaultMathNodeParameterMap[T];
export type MathNode<T extends MathNodeType = MathNodeType> = OptionalMathNode<T> & DefaultMathNode<T>;
export type ComputedMathNode<T extends MathNodeType = MathNodeType> = ComputedMathNodeParameterMap[T];