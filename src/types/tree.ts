// Tree node data types
export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  isExpanded?: boolean;
  depth?: number;
}

export interface TreeNode {
  id: string;
  label: string;
  childrenIds: string[];
  parentId: string | null;
  isExpanded: boolean;
  depth: number;
}

export interface TreeState {
  nodes: Map<string, TreeNode>;
  rootId: string;
}

// Initial tree data as per requirements
export const initialTreeData: TreeNodeData = {
  id: 'root',
  label: 'Root',
  isExpanded: true,
  children: [
    {
      id: 'ha',
      label: 'HA',
      isExpanded: true,
      children: [
        { id: 'a1', label: 'A1', children: [] },
        { id: 'a2', label: 'A2', children: [] },
      ],
    },
    {
      id: 'b',
      label: 'B',
      isExpanded: true,
      children: [
        { id: 'b1', label: 'B1', children: [] },
        { id: 'b2', label: 'B2', children: [] },
      ],
    },
  ],
};

// Helper to flatten tree data into a map
export function flattenTreeData(
  data: TreeNodeData,
  parentId: string | null = null,
  depth: number = 0
): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();

  const node: TreeNode = {
    id: data.id,
    label: data.label,
    childrenIds: data.children?.map((c) => c.id) || [],
    parentId,
    isExpanded: data.isExpanded ?? true,
    depth,
  };

  map.set(data.id, node);

  data.children?.forEach((child) => {
    const childMap = flattenTreeData(child, data.id, depth + 1);
    childMap.forEach((v, k) => map.set(k, v));
  });

  return map;
}

// Get all visible node IDs (respecting collapsed state)
export function getVisibleNodeIds(
  nodes: Map<string, TreeNode>,
  nodeId: string,
  result: string[] = []
): string[] {
  const node = nodes.get(nodeId);
  if (!node) return result;

  result.push(nodeId);

  if (node.isExpanded) {
    node.childrenIds.forEach((childId) => {
      getVisibleNodeIds(nodes, childId, result);
    });
  }

  return result;
}

// Count total descendants (for badge)
export function countDescendants(
  nodes: Map<string, TreeNode>,
  nodeId: string
): number {
  const node = nodes.get(nodeId);
  if (!node || node.childrenIds.length === 0) return 0;

  let count = node.childrenIds.length;
  node.childrenIds.forEach((childId) => {
    count += countDescendants(nodes, childId);
  });

  return count;
}

// Search nodes by label
export function searchNodes(
  nodes: Map<string, TreeNode>,
  query: string
): string[] {
  if (!query.trim()) return [];

  const matches: string[] = [];
  const lowerQuery = query.toLowerCase();

  nodes.forEach((node) => {
    if (node.label.toLowerCase().includes(lowerQuery)) {
      matches.push(node.id);
    }
  });

  return matches;
}

// Get path from root to a node (for auto-expand on search)
export function getPathToNode(
  nodes: Map<string, TreeNode>,
  nodeId: string
): string[] {
  const path: string[] = [];
  let current = nodes.get(nodeId);

  while (current) {
    path.unshift(current.id);
    current = current.parentId ? nodes.get(current.parentId) : undefined;
  }

  return path;
}
