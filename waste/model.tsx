import { Option } from "../util/option"

/// ConfigNode Type

export type ConfigBaseNode = {
    type : ConfigNodeType,
    id ?: string
}

export type ConfigAlignNode = ConfigBaseNode & {
    type: ConfigNodeType.Align,
    children : ConfigNode[],
    style : ConfigFlexStyle,
}

export type ConfigFlexStyle = {
    direction : "row" | "column",
    align : AlignItemFunction,
    padding : Padding
}

export type ConfigTextNode = ConfigBaseNode & {
    type : ConfigNodeType.Text,
    text : string,
    style : ConfigTextStyle
}

export type ConfigTextStyle = {
    size : number;
    family : string;
    style : string;
    padding : Padding;
}

export type ConfigShapeBaseNode = ConfigBaseNode & {
    type : ConfigNodeType.Shape,
    shapeType : ConfigShapeType
    style : ConfigShapeStyle
}

export type ConfigShapeStyle = {
    padding : Padding;
}

export type ConfigRectNode = ConfigShapeBaseNode & {
    shapeType : ConfigShapeType.Rect
    style : {
        width : number;
        height : number;
    }
}

export type ConfigShapeNode = ConfigRectNode

export type ConfigNode = ConfigAlignNode | ConfigTextNode | ConfigShapeNode;

export enum ConfigNodeType {
    Text, Shape, Align,
}

export enum ConfigShapeType {
    Rect, Circle,
}

/// Computed Node Type

export type ComputedBaseNode = {
    type : ComputedNodeType,
}

export type ComputedAlignNode = ComputedBaseNode & {
    type : ComputedNodeType.Align,
    children : ComputedNode[],
    boundingBox : BoundingPaddingBox
    style : ComputedFlexStyle,
}

export type ComputedFlexStyle = {

}

export type ComputedTextNode = ComputedBaseNode & {
    type : ComputedNodeType.Text,
    text : string,
    boundingBox : BoundingTextBox,
    style : ComputedTextStyle,
}

export type ComputedTextStyle = {
    size : number;
    family : string;
    style : string;
}

export type ComputedShapeNode = ComputedBaseNode & {
    type : ComputedNodeType.Shape,
    shapeType : ComputedShapeType
    boundingBox : BoundingPaddingBox,
    style : ComputedShapeStyle,
}

export type ComputedRectNode = ComputedShapeNode & {
    shapeType : ComputedShapeType.Rect
}

export type ComputedShapeStyle = {
}

export type ComputedNode = ComputedAlignNode | ComputedTextNode | ComputedShapeNode;

export enum ComputedNodeType {
    Text, Shape, Align,
}

export enum ComputedShapeType {
    Rect, Circle,
}


/// Other Type

export type BoundingBox = {
    x : number,
    y : number,
    width : number,
    height : number,
}

export type BoundingPaddingBox = BoundingBox & {
    padding : Padding,
}

export type BoundingTextBox = BoundingPaddingBox & {
    metrics : TextMetrics,
}

export type Position = {
    x : number,
    y : number,
}

export type Padding = {
    top : number,
    right : number,
    bottom : number,
    left : number,
}

export type AlignItemFunction = (
    node : ConfigAlignNode,
    computedBoundingBox : BoundingPaddingBox, 
    computedChild : ComputedNode[]
) => void;
