import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { TreeNode } from '@/types/tree';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export function calculateLayout(
  treeNodes: Map<string, TreeNode>,
  visibleIds: string[],
  hoveredNodeId: string | null,
  selectedNodeId: string | null,
  searchMatches: string[]
): LayoutResult {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'TB', // Top to Bottom
    nodesep: HORIZONTAL_SPACING,
    ranksep: VERTICAL_SPACING,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Add visible nodes to dagre
  visibleIds.forEach((id) => {
    const treeNode = treeNodes.get(id);
    if (treeNode) {
      g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
  });

  // Add edges for visible nodes
  const edges: Edge[] = [];
  visibleIds.forEach((id) => {
    const treeNode = treeNodes.get(id);
    if (treeNode && treeNode.parentId && visibleIds.includes(treeNode.parentId)) {
      g.setEdge(treeNode.parentId, id);

      const isHovered = hoveredNodeId === treeNode.parentId || hoveredNodeId === id;
      const isSelected = selectedNodeId === treeNode.parentId || selectedNodeId === id;

      edges.push({
        id: `${treeNode.parentId}-${id}`,
        source: treeNode.parentId,
        target: id,
        type: 'smoothstep',
        animated: isHovered || isSelected,
        style: {
          stroke: isSelected
            ? 'hsl(24 95% 53%)'
            : isHovered
            ? 'hsl(199 89% 48%)'
            : 'hsl(217 33% 35%)',
          strokeWidth: isHovered || isSelected ? 2 : 1.5,
          filter: isHovered || isSelected ? 'drop-shadow(0 0 6px hsl(199 89% 48% / 0.5))' : 'none',
        },
      });
    }
  });

  // Calculate layout
  dagre.layout(g);

  // Convert dagre output to React Flow nodes
  const nodes: Node[] = visibleIds.map((id) => {
    const treeNode = treeNodes.get(id)!;
    const nodeWithPosition = g.node(id);

    const isHovered = hoveredNodeId === id;
    const isSelected = selectedNodeId === id;
    const isSearchMatch = searchMatches.includes(id);

    return {
      id,
      type: 'treeNode',
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      data: {
        label: treeNode.label,
        hasChildren: treeNode.childrenIds.length > 0,
        childCount: treeNode.childrenIds.length,
        isExpanded: treeNode.isExpanded,
        depth: treeNode.depth,
        isHovered,
        isSelected,
        isSearchMatch,
      },
    };
  });

  return { nodes, edges };
}
