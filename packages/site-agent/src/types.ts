import type { z } from "zod";

export type ActionDefinition = {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
};

export type SiteAction = {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  run: (args: Record<string, unknown>) => Promise<string> | string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
};

export type InferredAction = {
  name: string;
  args: Record<string, unknown>;
};

export type SectionMap = Record<string, { id: string; aliases: string[] }>;

export type ToolConfirmationFn = (
  input?: Record<string, unknown>
) => string | null;

export type ToolConfirmationMap = Record<string, ToolConfirmationFn>;
