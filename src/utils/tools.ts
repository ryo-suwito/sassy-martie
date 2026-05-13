export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
}

export const TOOLS: Record<string, ToolDefinition> = {
  "precision-chopper": {
    id: "precision-chopper",
    name: "Precision Chopper",
    tagline: "Crop and resize as you wish.",
    description: "Built by Martie. A lightweight tool for cropping and resizing PNGs while keeping that precious transparency.",
    href: "/tools/precision-chopper",
  },
  // Future tools can be added here
};

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS[id];
}
