// What the playground reads from the preview runtime's March about extensions (preview-runtime.ts › extensionInfo).
export type Spec = { type?: string; default?: unknown; doc?: string; values?: readonly unknown[] };
export interface ExtInfo {
  list: { name: string; target: string; scope: "global" | "scoped"; order: number; does: string[]; props: Record<string, Spec> }[];
  props: Record<string, { extension: string; props: Record<string, Spec> }[]>;
  traces: { cell: string; component: string; steps: { name: string; did: string[]; before?: Record<string, unknown>; after?: Record<string, unknown> }[] }[];
}
