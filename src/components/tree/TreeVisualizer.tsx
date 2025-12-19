import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

import TreeNodeComponent from './TreeNode';
import SearchBar from './SearchBar';
import ControlPanel from './ControlPanel';

import {
  TreeNode,
  initialTreeData,
  flattenTreeData,
  getVisibleNodeIds,
  searchNodes,
  getPathToNode,
} from '@/types/tree';
import { calculateLayout } from '@/lib/layoutEngine';

const nodeTypes = {
  treeNode: TreeNodeComponent,
};

function TreeVisualizerInner() {
  const reactFlowInstance = useReactFlow();
  const [treeNodes, setTreeNodes] = useState<Map<string, TreeNode>>(
    () => flattenTreeData(initialTreeData)
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const fitViewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesRef = useRef(nodes);

  // Keep nodesRef in sync
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Search matches
  const searchMatches = useMemo(() => {
    const matches = searchNodes(treeNodes, searchQuery);
    console.log('Search query:', searchQuery, 'Matches:', matches);
    return matches;
  }, [treeNodes, searchQuery]);

  // Visible node IDs
  const visibleIds = useMemo(() => {
    return getVisibleNodeIds(treeNodes, 'root');
  }, [treeNodes]);

  // Calculate layout - force recalculation when searchMatches changes
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = calculateLayout(
      treeNodes,
      visibleIds,
      hoveredNodeId,
      selectedNodeId,
      searchMatches
    );

    // Force new array references for React Flow to detect changes
    setNodes([...layoutNodes]);
    setEdges([...layoutEdges]);

    // Auto fit view after layout changes
    if (fitViewTimeoutRef.current) {
      clearTimeout(fitViewTimeoutRef.current);
    }
    fitViewTimeoutRef.current = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [treeNodes, visibleIds, hoveredNodeId, selectedNodeId, searchMatches, setNodes, setEdges, reactFlowInstance]);

  // Handle toggle, add, and delete events from custom nodes
  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ nodeId: string }>) => {
      const { nodeId } = e.detail;
      setTreeNodes((prev) => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, { ...node, isExpanded: !node.isExpanded });
        }
        return newMap;
      });
    };

    const handleAddNode = (e: CustomEvent<{ parentId: string }>) => {
      const { parentId } = e.detail;
      setTreeNodes((prev) => {
        const newMap = new Map(prev);
        const parentNode = newMap.get(parentId);

        if (parentNode) {
          // Generate new ID
          const newId = `node-${Date.now()}`;
          const newNode: TreeNode = {
            id: newId,
            label: `New Node`,
            childrenIds: [],
            parentId: parentId,
            isExpanded: false,
            depth: parentNode.depth + 1,
          };

          // Update parent's children
          const updatedParent = {
            ...parentNode,
            childrenIds: [...parentNode.childrenIds, newId],
            isExpanded: true, // Auto-expand parent to show new node
          };

          newMap.set(parentId, updatedParent);
          newMap.set(newId, newNode);
        }
        return newMap;
      });
    };

    const handleDeleteNode = (e: CustomEvent<{ nodeId: string }>) => {
      const { nodeId } = e.detail;
      setTreeNodes((prev) => {
        // Prevent deleting root
        const nodeToDelete = prev.get(nodeId);
        if (!nodeToDelete || !nodeToDelete.parentId) {
          return prev;
        }

        const newMap = new Map(prev);

        // Helper to collect all descendants
        const getDescendants = (id: string, ids: Set<string>) => {
          const node = newMap.get(id);
          if (node) {
            ids.add(id);
            node.childrenIds.forEach(childId => getDescendants(childId, ids));
          }
        };

        const nodesToRemove = new Set<string>();
        getDescendants(nodeId, nodesToRemove);

        // Remove nodes from map
        nodesToRemove.forEach(id => newMap.delete(id));

        // Update parent
        const parentNode = newMap.get(nodeToDelete.parentId);
        if (parentNode) {
          newMap.set(nodeToDelete.parentId, {
            ...parentNode,
            childrenIds: parentNode.childrenIds.filter(id => id !== nodeId)
          });
        }

        return newMap;
      });
    };

    const handleRenameNode = (e: CustomEvent<{ nodeId: string; newLabel: string }>) => {
      const { nodeId, newLabel } = e.detail;
      setTreeNodes((prev) => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, { ...node, label: newLabel });
        }
        return newMap;
      });
    };

    window.addEventListener('tree-node-toggle', handleToggle as EventListener);
    window.addEventListener('tree-node-add', handleAddNode as EventListener);
    window.addEventListener('tree-node-delete', handleDeleteNode as EventListener);
    window.addEventListener('tree-node-rename', handleRenameNode as EventListener);

    return () => {
      window.removeEventListener('tree-node-toggle', handleToggle as EventListener);
      window.removeEventListener('tree-node-add', handleAddNode as EventListener);
      window.removeEventListener('tree-node-delete', handleDeleteNode as EventListener);
      window.removeEventListener('tree-node-rename', handleRenameNode as EventListener);
    };
  }, []);

  // Auto-expand path and pan when search matches change
  useEffect(() => {
    if (searchMatches.length > 0 && currentMatchIndex < searchMatches.length) {
      const matchId = searchMatches[currentMatchIndex];
      const path = getPathToNode(treeNodes, matchId);

      // Expand all nodes in path
      setTreeNodes((prev) => {
        const newMap = new Map(prev);
        let changed = false;
        path.forEach((nodeId) => {
          const node = newMap.get(nodeId);
          if (node && !node.isExpanded) {
            newMap.set(nodeId, { ...node, isExpanded: true });
            changed = true;
          }
        });
        return changed ? newMap : prev;
      });

      // Pan to matched node after layout updates
      setTimeout(() => {
        const matchedNode = nodesRef.current.find((n) => n.id === matchId);
        if (matchedNode) {
          reactFlowInstance.setCenter(
            matchedNode.position.x + 80,
            matchedNode.position.y + 40,
            { zoom: 1.2, duration: 500 }
          );
        }
      }, 200);
    }
  }, [searchMatches, currentMatchIndex, treeNodes, reactFlowInstance]);

  // Node interaction handlers
  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 200 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 200 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlowInstance]);

  const handleReset = useCallback(() => {
    setTreeNodes(flattenTreeData(initialTreeData));
    setSearchQuery('');
    setSelectedNodeId(null);
    setCurrentMatchIndex(0);
  }, []);

  // Search navigation
  const handleNextMatch = useCallback(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
    }
  }, [searchMatches.length]);

  const handlePrevMatch = useCallback(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) =>
        prev === 0 ? searchMatches.length - 1 : prev - 1
      );
    }
  }, [searchMatches.length]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentMatchIndex(0);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header with search */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border"
      >
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          matchCount={searchMatches.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
        />
      </motion.header>

      {/* Main canvas */}
      <div className="flex-1 relative" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(217 33% 20%)"
          />
          <MiniMap
            nodeColor="hsl(24 95% 53%)"
            maskColor="hsl(222 47% 7% / 0.8)"
            style={{
              background: 'hsl(222 47% 11%)',
              borderRadius: '0.75rem',
            }}
          />
        </ReactFlow>

        {/* Control panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4"
        >
          <ControlPanel
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onReset={handleReset}
            nodeCount={treeNodes.size}
            visibleCount={visibleIds.length}
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 glass-card p-4"
        >
          <h3 className="text-sm font-semibold mb-3 text-foreground">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-muted-foreground">Expand/Collapse Toggle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent" />
              <span className="text-muted-foreground">Child Count Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-accent shadow-glow-blue" />
              <span className="text-muted-foreground">Hovered Edge</span>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border">
              <span className="text-muted-foreground italic">
                Right-click nodes to Add, Rename or Delete
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function TreeVisualizer() {
  return (
    <ReactFlowProvider>
      <TreeVisualizerInner />
    </ReactFlowProvider>
  );
}
