import type { WorkflowNode, WorkflowEdge, WorkflowSchema } from '../types';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建默认节点
 */
export function createDefaultNode(
  label: string,
  x: number,
  y: number,
  type: WorkflowNode['type'] = 'task'
): WorkflowNode {
  return {
    id: generateId(),
    type,
    x,
    y,
    label,
  };
}

/**
 * 创建默认连线
 */
export function createDefaultEdge(source: string, target: string): WorkflowEdge {
  return {
    id: `edge_${source}_${target}`,
    source,
    target,
  };
}

/**
 * 创建示例工作流
 */
export function createSampleWorkflow(): WorkflowSchema {
  const node1 = createDefaultNode('Vue3 学习', 50, 50);
  const node2 = createDefaultNode('AntV X6 集成', 250, 50);
  const node3 = createDefaultNode('LKE 检索集成', 450, 50);

  return {
    name: '示例学习路径',
    description: '这是一个示例工作流',
    nodes: [node1, node2, node3],
    edges: [
      createDefaultEdge(node1.id, node2.id),
      createDefaultEdge(node2.id, node3.id),
    ],
  };
}

/**
 * 验证工作流 Schema
 */
export function validateWorkflowSchema(schema: WorkflowSchema): boolean {
  if (!schema.name) return false;
  if (!Array.isArray(schema.nodes)) return false;
  if (!Array.isArray(schema.edges)) return false;

  // 验证节点
  for (const node of schema.nodes) {
    if (!node.id || !node.label || node.x === undefined || node.y === undefined) {
      return false;
    }
  }

  // 验证连线
  for (const edge of schema.edges) {
    if (!edge.source || !edge.target) {
      return false;
    }
    // 检查节点是否存在
    const sourceExists = schema.nodes.some((n) => n.id === edge.source);
    const targetExists = schema.nodes.some((n) => n.id === edge.target);
    if (!sourceExists || !targetExists) {
      return false;
    }
  }

  return true;
}

/**
 * 深拷贝工作流 Schema
 */
export function cloneWorkflowSchema(schema: WorkflowSchema): WorkflowSchema {
  return JSON.parse(JSON.stringify(schema));
}