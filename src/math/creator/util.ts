import { Color, Padding, Position } from "../types/type";

// similar as Object.assign, but get also get setters / getters
export const completeAssign = <T extends object, S extends object>(target: T, source: S): T & S => {
  const descriptors: {
    [key: string | symbol]: PropertyDescriptor
  } = {}

  Object.keys(source).forEach((key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(source, key)!;
  })

  // By default, Object.assign copies enumerable Symbols, too
  Object.getOwnPropertySymbols(source).forEach(sym => {
    const descriptor = Object.getOwnPropertyDescriptor(source, sym)!;
    descriptor.enumerable === true && (descriptors[sym] = descriptor);
  });

  Object.defineProperties(target, descriptors);

  // manually coercing type
  return target as T & S;
}

export const position = completeAssign((x : number, y : number) => ({x, y}), {
  get zero(): Position {
    return {
      x: 0,
      y: 0
    }
  }
})

export const boundingBox = (
  x: number,
  y: number,
  innerWidth: number,
  innerHeight: number,
  padding: Padding
) => ({
  x, y,
  innerWidth,
  innerHeight,
  width : innerWidth + padding.left + padding.right,
  height : innerHeight + padding.top + padding.bottom,
})

export const color = {
  get black(): Color {
    return "black"
  }
}

export type PaddingCreator = {
  (side: number): Padding,
  (horizontal: number, vertical: number): Padding,
  (left: number, vertical: number, right: number): Padding,
  (left: number, top: number, right: number, bottom: number): Padding
  get zero(): Padding
}

export const padding: PaddingCreator = completeAssign((
  first: number,
  second?: number,
  third?: number,
  fourth?: number
) => {
  const hasSecond = second !== undefined;
  const hasThird = third !== undefined;
  const hasFourth = fourth !== undefined;

  if (hasSecond && hasThird && hasFourth) {
    return {
      left: first,
      top: second,
      right: third,
      bottom: fourth
    }
  } else if (hasSecond && hasThird && !hasFourth) {
    return {
      left: first,
      top: second,
      right: third,
      bottom: second
    }
  } else if (hasSecond && !hasThird && !hasFourth) {
    return {
      left: first,
      top: second,
      right: first,
      bottom: second
    }
  } else if (!hasSecond && !hasThird && !hasFourth) {
    return {
      left: first,
      top: first,
      right: first,
      bottom: first
    }
  } else {
    throw new Error("Invalid padding arguments")
  }
}, {
  get zero(): Padding {
    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  }
});

export const combine = <T extends object, S extends object>(a : T, b : S) : T & S => {
  return {
    ...a,
    ...b
  }
}
