import { panic } from '../src/util/panic';
import { Ok, Err, Result } from '../src/util/result';
import { BoundingBox, BoundingPaddingBox, ComputedAlignNode, ComputedNode, ComputedNodeType, ComputedShapeNode, ComputedShapeType, ComputedTextNode, ConfigAlignNode, ConfigNode, ConfigNodeType, ConfigRectNode, ConfigShapeNode, ConfigShapeType, ConfigTextNode, ConfigTextStyle, Position } from '../src/math/model';

export class CanvasRender {
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private constructor(
        canvas : HTMLCanvasElement,
        ctx : CanvasRenderingContext2D
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    public static fromCanvas(canvas : HTMLCanvasElement) : Result<CanvasRender, CanvasGetContextError> {
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            return Err("Cannot Get 2D Context");
        }
        return Ok(new CanvasRender(canvas, ctx));
    }

    public static fromContext(ctx : CanvasRenderingContext2D) : CanvasRender {
        return new CanvasRender(ctx.canvas, ctx);
    }

    public compute(node : ConfigNode) {
        return this.computeRecursive(node, {
            x: 0,
            y: 0,
        });
    }

    private computeRecursive(node : ConfigNode, position : Position) : ComputedNode {
        if (node.type === ConfigNodeType.Text) {
            return this.computeText(node, position);
        } else if (node.type === ConfigNodeType.Align) {
            return this.computeAlign(node, position)
        } else {
            return this.computeShape(node, position)
        }
    }

    private computeText(node : ConfigTextNode, position : Position) : ComputedTextNode {
        const metrics = this.measureText(node.text, node.style);
        const {
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
            actualBoundingBoxLeft,
            actualBoundingBoxRight,
        } = metrics;

        const padding = node.style.padding;

        return {
            type: ComputedNodeType.Text,
            boundingBox: {
                x : position.x,
                y : position.y,
                width : actualBoundingBoxLeft + actualBoundingBoxRight + padding.left + padding.right,
                height : actualBoundingBoxAscent + actualBoundingBoxDescent + padding.top + padding.bottom,
                metrics, padding
            },
            text: node.text,
            style: {
                size : node.style.size,
                family : node.style.family,
                style : node.style.style,
            },
        };
    }

    private computeAlign(node : ConfigAlignNode, position : Position) : ComputedAlignNode {
        const {
            children,
            style
        } = node;

        if (node.style.direction === "row") {
            let xShift = 0;

            // get computed children

            const computedChildren = node.children.map((child, i) => {
                const childPosition = {
                    x: xShift,
                    y: 0,
                };
                const computedChild = this.computeRecursive(child, childPosition);
                xShift += computedChild.boundingBox.width;
                return computedChild;
            });

            // compute bounding box

            const innerHeight = computedChildren.reduce(
                (acc, child) => Math.max(acc, child.boundingBox.height), 
                0
            );

            const computedBoundingBox = {
                x: position.x,
                y: position.y,
                width : xShift + style.padding.left + style.padding.right,
                height : innerHeight + style.padding.top + style.padding.bottom,
                padding : style.padding
            };

            node.style.align(node, computedBoundingBox, computedChildren)

            return {
                type: ComputedNodeType.Align,
                boundingBox: computedBoundingBox,
                children: computedChildren,
                style: {},
            };
        } else {
            let yShift = 0;

            // get computed children
            const computedChildren = node.children.map((child, i) => {
                const childPosition = {
                    x: 0,
                    y: yShift,
                };
                const computedChild = this.computeRecursive(child, childPosition);
                yShift += computedChild.boundingBox.height;
                return computedChild;
            });

            // compute bounding box
            const innerWidth = computedChildren.reduce(
                (acc, child) => Math.max(acc, child.boundingBox.width), 
                0
            );

            const computedBoundingBox = {
                x: position.x,
                y: position.y,
                width : innerWidth + style.padding.left + style.padding.right,
                height : yShift + style.padding.top + style.padding.bottom,
                padding : style.padding
            };

            node.style.align(node, computedBoundingBox, computedChildren)
            
            return {
                type: ComputedNodeType.Align,
                boundingBox: computedBoundingBox,
                children: computedChildren,
                style: {},
            };
        }
    }

    private computeShape(node : ConfigShapeNode, position : Position) : ComputedShapeNode {
        if (node.shapeType === ConfigShapeType.Rect) {
            return this.computeRect(node, position);
        } else {
            throw panic("Unsupported Shape Type");
        }
    }

    private computeRect(node : ConfigRectNode, position : Position) : ComputedShapeNode {
        const padding = node.style.padding;

        return {
            type: ComputedNodeType.Shape,
            shapeType : ComputedShapeType.Rect,
            boundingBox : {
                x : position.x,
                y : position.y,
                width : node.style.width + padding.left + padding.right,
                height : node.style.height + padding.top + padding.bottom,
                padding
            },
            style : {}
        }
    }

    public render(node : ComputedNode, shift : Position) {
        if (node.type === ComputedNodeType.Text) {
            this.renderText(node, shift);
        } else if (node.type === ComputedNodeType.Align) {
            this.renderAlign(node, shift);
        } else {
            this.renderShape(node, shift);
        }
    }

    private renderText(node : ComputedTextNode, shift : Position) {
        this.ctx.save();

        const x = shift.x + node.boundingBox.x;
        const y = shift.y + node.boundingBox.y;
        const {
            style, boundingBox,
        } = node;

        const {
            width, height, padding
        } = boundingBox;

        // Debug bounding box
        this.ctx.strokeRect(
            x, y,
            boundingBox.width, 
            boundingBox.height
        );

        // Debug Padding box
        const tmp = this.ctx.fillStyle;

        this.ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
        this.ctx.fillRect(x, y, boundingBox.width, boundingBox.height);

        this.ctx.fillStyle = "rgba(0, 255, 0, 0.15)";

        this.ctx.fillRect(
            x + padding.left,
            y + padding.top,
            width - padding.left - padding.right,
            height - padding.top - padding.bottom
        );

        this.ctx.fillStyle = tmp;

        // Render text
        
        this.ctx.font = `${style.style} ${style.size}px ${style.family}`;
        this.ctx.fillText(
            node.text, 
            x + boundingBox.metrics.actualBoundingBoxLeft + padding.left,
            y + boundingBox.metrics.actualBoundingBoxAscent + padding.top
        );


        this.ctx.restore();
    }

    private renderAlign(node : ComputedAlignNode, shift: Position) {
        this.ctx.save();

        const x = shift.x + node.boundingBox.x;
        const y = shift.y + node.boundingBox.y;
        const {
            padding, width, height
        } = node.boundingBox;

        // debug bounding box
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.strokeRect(x, y, node.boundingBox.width, node.boundingBox.height);

        // Debug padding box
        const tmp = this.ctx.fillStyle;

        this.ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.fillStyle = "rgba(0, 255, 0, 0.15)";

        this.ctx.fillRect(
            x + padding.left,
            y + padding.top,
            width - padding.left - padding.right,
            height - padding.top - padding.bottom
        );

        this.ctx.fillStyle = tmp;

        this.ctx.restore()

        node.children.forEach((child, i) => {
            this.render(child, {
                x : x + padding.left,
                y : y + padding.top,
            });
        });
    }

    private renderShape(node : ComputedShapeNode, shift : Position) {
        if (node.shapeType === ComputedShapeType.Rect) {
            this.renderRect(node, shift);
        } else {
            throw panic("Unsupported Shape Type");
        }
    }

    private renderRect(node : ComputedShapeNode, shift : Position) {
        this.ctx.save();

        const x = shift.x + node.boundingBox.x;
        const y = shift.y + node.boundingBox.y;

        const {
            style, boundingBox,
        } = node;

        const {
            width, height, padding
        } = boundingBox;

        // debug bounding box
        this.ctx.strokeRect(
            x, y, 
            node.boundingBox.width, 
            node.boundingBox.height
        );

        // Debug padding box
        const tmp = this.ctx.fillStyle;

        this.ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
        this.ctx.fillRect(x, y, width, height);

        // Rect
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(
            x + padding.left,
            y + padding.top,
            width - padding.left - padding.right,
            height - padding.top - padding.bottom
        );

        this.ctx.restore();
    }

    private measureText(text : string, style : ConfigTextStyle) {
        this.ctx.save();

        this.ctx.font = `${style.style} ${style.size}px ${style.family}`;
        const metrics = this.ctx.measureText(text);

        this.ctx.restore();

        return metrics;
    }
}

export namespace AlignFunction {
    export function Start(
        node : ConfigAlignNode,
        boundingBox : BoundingPaddingBox, 
        children : ComputedNode[]
    ) {
        // dummy function
    }

    export function End(
        node : ConfigAlignNode,
        boundingBox : BoundingPaddingBox, 
        children : ComputedNode[]
    ) {
        const { width, height, padding } = boundingBox;

        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;

        if (node.style.direction === "column") {
            for (const child of children) {
                child.boundingBox.x = innerWidth - child.boundingBox.width;
            }
        } else {
            for (const child of children) {
                child.boundingBox.y = innerHeight - child.boundingBox.height;
            }
        }
    }

    export function Center(
        node : ConfigAlignNode,
        boundingBox : BoundingPaddingBox, 
        children : ComputedNode[]
    ) {
        const { width, height, padding } = boundingBox;

        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;

        if (node.style.direction === "column") {
            for (const child of children) {
                child.boundingBox.x = (innerWidth - child.boundingBox.width) / 2;
            }
        } else {
            for (const child of children) {
                child.boundingBox.y = (innerHeight - child.boundingBox.height) / 2;
            }
        }
    }

    export function By(parameter : AlignParameter) {
        return (
            node : ConfigAlignNode,
            boundingBox : BoundingPaddingBox, 
            children : ComputedNode[]
        ) => {
            if (node.style.direction === "column") {

                const leftDistance = children.map((child, i) => {
                    // -1 means the child itself
                    const { index, align } = parameter[i];


                    if (index === -1) {
                        if (align === "start") {
                            return 0;
                        } else if (align === "end") {
                            return child.boundingBox.width;
                        } else {
                            return (child.boundingBox.width) / 2;
                        }
                    }

                    // other positive numbers means the children of the child
                    if (child.type !== ComputedNodeType.Align) {
                        throw panic("Align.By only works with Align nodes when aligning using children");
                    }
                    
                    const aligningChildren = child.children[index];
                    if (align === "start") {
                        return aligningChildren.boundingBox.x;
                    } else if (align === "end") {
                        return aligningChildren.boundingBox.x + aligningChildren.boundingBox.width;
                    } else {
                        return aligningChildren.boundingBox.x + aligningChildren.boundingBox.width / 2;
                    }
                })

                console.log(leftDistance);

                const maxDistance = Math.max(...leftDistance);

                for (const [index, child] of children.entries()) {
                    child.boundingBox.x += maxDistance - leftDistance[index];
                }

                // recompute the bounding box
                const newWidth = children.reduce((acc, child) => 
                    Math.max(acc, child.boundingBox.x + child.boundingBox.width), 
                    0
                );

                boundingBox.width = newWidth + boundingBox.padding.left + boundingBox.padding.right;

            } else {

                const topDistance = children.map((child, i) => {
                    // -1 means the child itself
                    const { index, align } = parameter[i];

                    if (index === -1) {
                        if (align === "start") {
                            return 0;
                        } else if (align === "end") {
                            return boundingBox.height - child.boundingBox.height;
                        } else {
                            return (boundingBox.height - child.boundingBox.height) / 2;
                        }
                    }


                    // other positive numbers means the children of the child
                    if (child.type !== ComputedNodeType.Align) {
                        throw panic("Align.By only works with Align nodes when aligning using children");
                    }
                    
                    const aligningChildren = child.children[index];
                    if (align === "start") {
                        return aligningChildren.boundingBox.y;
                    } else if (align === "end") {
                        return aligningChildren.boundingBox.y + aligningChildren.boundingBox.height;
                    } else {
                        return aligningChildren.boundingBox.y + aligningChildren.boundingBox.height / 2;
                    }
                })

                const maxDistance = Math.max(...topDistance);

                for (const [index, child] of children.entries()) {
                    child.boundingBox.y += maxDistance - topDistance[index];
                }

                // recompute the bounding box
                const newHeight = children.reduce((acc, child) => 
                    Math.max(acc, child.boundingBox.y + child.boundingBox.height), 
                    0
                );

                boundingBox.height = newHeight + boundingBox.padding.top + boundingBox.padding.bottom;
            }
        }
    }
}

export type AlignParameter = {
    index : number,
    align : "start" | "end" | "center"
}[];


export type CanvasGetContextError = "Cannot Get 2D Context";