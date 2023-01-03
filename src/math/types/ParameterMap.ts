import { MathNodeType, Text, Rect, Circle, Align } from "./MathNodeType";
import { ParameterMap, AlignFnMap, TypeKeyMap, Padding, Color, TextSize, TextFont, TextStyle, AnyObject, MathNode, AlignDirection, BoundingBox, ComputedMathNode, AdaptivePadding, AlignType } from "./type";

export type MathNodeParameterMap = ParameterMap<AlignFnMap<TypeKeyMap<{
  [Text]: {
    text: string;
    padding?: Padding;
    color?: Color;
    textColor?: Color;
    size?: TextSize;
    font?: TextFont;
    style?: TextStyle;
    data?: AnyObject;
  };
  [Rect]: {
    width: number;
    height: number;
    color?: Color;
    padding?: Padding;
    data?: AnyObject;
  };
  [Circle]: {
    radius: number;
    color?: Color;
    padding?: Padding;
    data?: AnyObject;
  };
  [Align]: {
    children?: MathNode[];
    direction?: AlignDirection;
    color?: Color;
    padding?: Padding;
    data?: AnyObject;
  };
}>>, {
  [MathNodeType.Text]: {
    id: string;
  };
  [MathNodeType.Rect]: {
    id: string;
  };
  [MathNodeType.Circle]: {
    id: string;
  };
  [MathNodeType.Align]: {
    id: string;
  };
}>;
export type ComputedMathNodeParameterMap = TypeKeyMap<{
  [MathNodeType.Text]: {
    id?: string;
    text: string;
    boundingBox: BoundingBox;
    textMetrics: TextMetrics;
    padding: Padding;
    color: Color;
    textColor: Color;
    size: TextSize;
    font: TextFont;
    style: TextStyle;
  };
  [MathNodeType.Rect]: {
    id?: string;
    boundingBox: BoundingBox;
    color: Color;
    padding: Padding;
  };
  [MathNodeType.Circle]: {
    id?: string;
    boundingBox: BoundingBox;
    radius: number;
    color: Color;
    padding: Padding;
  };
  [MathNodeType.Align]: {
    id?: string;
    direction: AlignDirection;
    children: ComputedMathNode[];
    boundingBox: BoundingBox;
    color: Color;
    padding: Padding;
  };
}>;
type AdaptiveMathNodeParameterMap = AlignFnMap<TypeKeyMap<{
  [Text]: {
    text: string;
    padding?: AdaptivePadding;
    color?: Color;
    textColor?: Color;
    size?: TextSize;
    font?: TextFont;
    style?: TextStyle;
    data?: AnyObject;
    alignSelf?: AlignType;
  };
  [Rect]: {
    width: number;
    height: number;
    color?: Color;
    padding?: AdaptivePadding;
    data?: AnyObject;
    alignSelf?: AlignType;
  };
  [Circle]: {
    radius: number;
    color?: Color;
    padding?: AdaptivePadding;
    data?: AnyObject;
    alignSelf?: AlignType;
  };
  [Align]: {
    children?: MathNode[];
    direction?: AlignDirection;
    align?: AlignType;
    color?: Color;
    padding?: AdaptivePadding;
    data?: AnyObject;
    alignSelf?: AlignType;
  };
}>>;
