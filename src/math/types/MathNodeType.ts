export enum MathNodeType {
  Text, Rect, Circle, Align
}
// name shorthand

export type Text = MathNodeType.Text;
export type Rect = MathNodeType.Rect;
export type Circle = MathNodeType.Circle;
export type Align = MathNodeType.Align;
export const { Text, Rect, Circle, Align } = MathNodeType;
