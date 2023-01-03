// map normal input text -> to different to match latex one
import { createNode } from "../creator/creator";
import { CharFontMap, mathCharFontMap } from "./fontMap";
import { MathNode } from "../types/type";
import { Text } from "../types/MathNodeType";

export const groupString = <P>(str : string, fn : (char : string) => P) : string[] => {
    const arr : string[] = [];
    const charList = str.split("");
    const fnResult = charList.map(fn);

    for (const index of charList.keys()) {
        index === 0 || fnResult[index] !== fnResult[index - 1] 
            ? arr.push(charList[index]) 
            : arr[arr.length - 1] += charList[index];
    }

    return arr;
}

export const groupStringByFontMap = (str : string, fontMap : CharFontMap) => {
    return groupString(str, (char) => fontMap[char][0])
}

export const stringListToNode = (strList : string[], fontSize ?: number, fontMap : CharFontMap = mathCharFontMap) : MathNode<Text>[] => {
    return strList.map(str => createNode({
        type : Text,
        text : str.split("").map(char => fontMap[char][1]).join(""),
        size : fontSize,
        font : fontMap[str[0]][0]
    }))
}

export const stringToNodeByFontMap = (str : string, fontSize ?: number, fontMap : CharFontMap = mathCharFontMap) => {
    return stringListToNode(groupStringByFontMap(str, fontMap), fontSize, fontMap)
}
