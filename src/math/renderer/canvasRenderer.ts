import { ComputedMathNode, Position } from "../types/type"
import { MathNodeType, Text, Rect, Circle, Align } from "../types/MathNodeType";

export const getCanvasRenderer = (
  ctx : CanvasRenderingContext2D,
  rendererMap : CanvasRendererMap,
) => {
  return function scoped<T extends MathNodeType>(
    node : Readonly<ComputedMathNode<T>>, 
    position : Position
  ) {
    rendererMap[node.type](
      ctx, node, position, scoped
    );
  }
}

export type CanvasRendererScoped = <T extends MathNodeType>(
  node : Readonly<ComputedMathNode<T>>,
  position : Position,
) => void;

type CanvasRendererMap = {
  [K in MathNodeType] : CanvasRendererFunction<K>
}

type CanvasRendererFunction<T extends MathNodeType> = (
  ctx : CanvasRenderingContext2D,
  node : Readonly<ComputedMathNode<T>>,
  shift : Position,
  renderFn : CanvasRendererScoped | never
) => void;


export const canvasRendererMap : CanvasRendererMap = {
  [Text] : (
    ctx, {
      boundingBox,
      padding : {
        left, top
      }, 
      textMetrics : {
        actualBoundingBoxAscent,
        actualBoundingBoxLeft,
      }, 
      style, size, font, text, textColor, color
    }, shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;
    
    ctx.font = `${style} ${size}px ${font}`;

    ctx.fillStyle = textColor;
    ctx.fillText(
      text,
      x + actualBoundingBoxLeft + left,
      y + actualBoundingBoxAscent + top,
    )

    ctx.restore();
  },
  [Rect] : (
    ctx, {
      boundingBox,
      boundingBox : { innerWidth, innerHeight },
      padding : { left, top },
      color
    },
    shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    ctx.fillStyle = color;
    ctx.fillRect(
      x + left,
      y + top,
      innerWidth,
      innerHeight
    )

    ctx.restore();
  },
  [Circle] : (
    ctx, {
      boundingBox,
      padding : { left, top },
      color,
      radius
    },
    shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.ellipse(
      x + radius + left, y + radius + top, 
      radius, radius, 
      0, 0, 2 * Math.PI
    );
    ctx.closePath();

    ctx.fill();

    ctx.restore();
  },
  [Align] : (
    ctx, {
      boundingBox,
      children,
      padding : { left, top }
    },
    shift,
    renderFn,
  ) => {
    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    children.forEach((child, i) => {
      renderFn(child, {
        x : x + left,
        y : y + top,
      })
    })
  }
}

export const canvasDebugRendererMap : CanvasRendererMap = {
  [MathNodeType.Text] : (
    ctx, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight },
      padding : { left, top }
    }, shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = 'rgba(0, 0, 255, 0.15)';
    ctx.fillRect(x, y, width, height)

    ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.fillRect(
      x + left,
      y + top,
      innerWidth,
      innerHeight
    )

    ctx.restore()
  },
  [MathNodeType.Rect] : (
    ctx, {
      boundingBox, 
      boundingBox : { width, height, innerWidth, innerHeight }, 
      padding : { left, top }
    }, shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    // outline the bounding box
    ctx.strokeRect(x, y, width, height);

    // fill the bounding padding
    ctx.fillStyle = 'rgba(0, 0, 255, 0.15)';
    ctx.fillRect(x, y, width, height);

    // fill the inner part
    ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.fillRect(x + left, y + top, innerWidth, innerHeight);

    ctx.restore()
  },
  [MathNodeType.Circle] : (
    ctx, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight }, 
      padding : { left, top }
    }, shift
  ) => {
    ctx.save();

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    ctx.strokeRect(x, y, width, height)

    ctx.fillStyle = 'rgba(0, 0, 255, 0.15)';
    ctx.fillRect(x, y, width, height);

    // fill the inner part
    ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.fillRect(x + left, y + top, innerWidth, innerHeight);

    ctx.restore()
  },
  [MathNodeType.Align] : (
    ctx, {
      boundingBox,
      boundingBox : { width, height, innerWidth, innerHeight },
      padding : {
        left, top, right, bottom
      }, 
      children
    }, shift, renderFn, 
  ) => {
    ctx.save()

    const x = shift.x + boundingBox.x;
    const y = shift.y + boundingBox.y;

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = "rgba(0, 255, 0, 0.15)";
    ctx.fillRect(
      x + left,
      y + top,
      innerWidth,
      innerHeight
    )

    ctx.restore()

    children.forEach((child) => {
      renderFn(child, {
        x : x + left,
        y : y + top,
      })
    })
  }
}

