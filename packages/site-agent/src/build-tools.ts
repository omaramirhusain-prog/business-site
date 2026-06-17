import { tool, type ToolSet } from "ai";
import type { ActionDefinition } from "./types";

export function buildToolsFromDefinitions(definitions: ActionDefinition[]): ToolSet {
  const tools: ToolSet = {};
  for (const def of definitions) {
    tools[def.name] = tool({
      description: def.description,
      inputSchema: def.parameters,
    });
  }
  return tools;
}
