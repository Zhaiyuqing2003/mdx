export const idParser = <T extends ParsableNode>(node : Readonly<T>) => {
  const map = new Map<string, T>();

  idParserInternal(node, map);
  return map;
}

const idParserInternal = (
  node : Readonly<ParsableNode>, 
  map : Map<string, ParsableNode>
) => {
  if (node.id !== undefined) {
    if (map.has(node.id)) {
      throw new Error(`id ${node.id} is already used`);
    } else {
      map.set(node.id, node);
    }
  }

  if (node.children !== undefined) {
    for (const child of node.children) {
      idParserInternal(child, map);
    }
  }
}

type ParsableNode = {
  id ?: string;
  children ?: ParsableNode[];
}