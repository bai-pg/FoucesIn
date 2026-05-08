import { ref, onBeforeUnmount } from 'vue';
import { Graph } from '@antv/x6';
import type { WorkflowNode, WorkflowEdge, WorkflowSchema, GraphConfig } from '../types';

/**
 * 画布交互逻辑组合式函数
 * 负责X6画布的初始化、节点操作、事件处理
 */
export function useCanvasInteraction() {
  const graph = ref<Graph | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);

  // 默认配置
  const defaultConfig: GraphConfig = {
    width: 800,
    height: 500,
    gridSize: 10,
    enableGrid: true,
    enableSnapline: true,
    enableKeyboard: true,
    enableHistory: true,
  };

  /**
   * 初始化画布
   */
  function initGraph(config: Partial<GraphConfig> = {}) {
    if (!containerRef.value) return;

    const finalConfig = { ...defaultConfig, ...config };

    graph.value = new Graph({
      container: containerRef.value,
      width: finalConfig.width,
      height: finalConfig.height,
      grid: finalConfig.enableGrid
        ? {
            visible: true,
            type: 'dot',
            size: finalConfig.gridSize,
          }
        : false,
      panning: true,
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 2,
      },
      connecting: {
        router: 'manhattan',
        connector: 'rounded',
        allowNode: () => true,
        allowEdge: () => true,
        allowLoop: false,
        highlight: true,
        snap: true,
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    });

    // 启用选择功能
    graph.value.enableSelection();

    // 绑定事件
    bindEvents();

    return graph.value;
  }

  /**
   * 绑定画布事件
   */
  function bindEvents() {
    if (!graph.value) return;

    graph.value.on('node:click', ({ node }) => {
      console.log('Node clicked:', node);
    });

    graph.value.on('edge:connected', ({ edge }) => {
      console.log('Edge connected:', edge);
    });
  }

  /**
   * 添加节点
   */
  function addNode(nodeData: WorkflowNode) {
    if (!graph.value) return;

    graph.value.addNode({
      id: nodeData.id,
      shape: 'rect',
      x: nodeData.x,
      y: nodeData.y,
      width: 160,
      height: 60,
      label: nodeData.label,
      ports: {
        groups: {
          in: {
            position: 'left',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          out: {
            position: 'right',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { id: 'port-in', group: 'in' },
          { id: 'port-out', group: 'out' },
        ],
      },
      attrs: {
        body: {
          fill: nodeData.type === 'condition' ? '#FFF7E6' : '#fff',
          stroke: nodeData.type === 'condition' ? '#FA8C16' : '#5F95FF',
          strokeWidth: 2,
          rx: 6,
          ry: 6,
        },
        label: {
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    });
  }

  /**
   * 批量添加节点
   */
  function addNodes(nodes: WorkflowNode[]) {
    nodes.forEach((node) => addNode(node));
  }

  /**
   * 添加连线
   */
  function addEdge(edgeData: WorkflowEdge) {
    if (!graph.value) return;

    graph.value.addEdge({
      id: edgeData.id,
      source: { cell: edgeData.source },
      target: { cell: edgeData.target },
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    });
  }

  /**
   * 批量添加连线
   */
  function addEdges(edges: WorkflowEdge[]) {
    edges.forEach((edge) => addEdge(edge));
  }

  /**
   * 从 Schema 加载整个工作流
   */
  function loadWorkflow(schema: WorkflowSchema) {
    if (!graph.value) return;

    graph.value.clearCells();
    addNodes(schema.nodes);
    addEdges(schema.edges);
  }

  /**
   * 导出当前画布为 Schema
   */
  function exportToSchema(name: string, description?: string): WorkflowSchema {
    if (!graph.value) {
      throw new Error('画布未初始化');
    }

    const nodes = graph.value.getNodes().map((node) => {
      const position = node.getPosition();
      const label = node.getAttrByPath('label/text') as string || node.id;
      return {
        id: node.id,
        type: 'task' as const,
        x: position.x,
        y: position.y,
        label,
      };
    });

    const edges = graph.value.getEdges().map((edge) => {
      const source = edge.getSourceCellId();
      const target = edge.getTargetCellId();
      return {
        id: edge.id,
        source,
        target,
      };
    });

    return {
      name,
      description,
      nodes,
      edges,
    };
  }

  /**
   * 清空画布
   */
  function clearCanvas() {
    if (!graph.value) return;
    graph.value.clearCells();
  }

  /**
   * 销毁画布
   */
  function disposeGraph() {
    if (graph.value) {
      graph.value.dispose();
      graph.value = null;
    }
  }

  onBeforeUnmount(() => {
    disposeGraph();
  });

  return {
    graph,
    containerRef,
    initGraph,
    addNode,
    addNodes,
    addEdge,
    addEdges,
    loadWorkflow,
    exportToSchema,
    clearCanvas,
    disposeGraph,
  };
}