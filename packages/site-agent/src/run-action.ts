import type { ActionDefinition, ActionResult, SiteAction } from "./types";

export function createActionsFromDefinitions(
  definitions: ActionDefinition[],
  handlers: Record<string, SiteAction["run"]>
): SiteAction[] {
  return definitions.map((def) => ({
    name: def.name,
    description: def.description,
    parameters: def.parameters,
    run:
      handlers[def.name] ??
      (() => `No handler registered for action "${def.name}".`),
  }));
}

export async function runAction(
  actions: SiteAction[],
  name: string,
  args: Record<string, unknown> = {}
): Promise<ActionResult> {
  const action = actions.find((a) => a.name === name);
  if (!action) {
    return { ok: false, message: `Unknown action: ${name}` };
  }
  try {
    const parsed = action.parameters.safeParse(args);
    const finalArgs = parsed.success
      ? (parsed.data as Record<string, unknown>)
      : args;
    const message = await action.run(finalArgs);
    return { ok: true, message };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Action failed.",
    };
  }
}
