"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SceneControls = {
  spinSpeed: number;
  distort: number;
  color: string;
  floatIntensity: number;
};

type SceneContextValue = {
  controls: SceneControls;
  applySceneControl: (args: Partial<SceneControls>) => string;
};

const DEFAULT_CONTROLS: SceneControls = {
  spinSpeed: 1.4,
  distort: 0.45,
  color: "#7c5cff",
  floatIntensity: 1.6,
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<SceneControls>(DEFAULT_CONTROLS);

  const applySceneControl = useCallback((args: Partial<SceneControls>) => {
    setControls((prev) => {
      const next = { ...prev, ...args };
      return next;
    });

    const parts: string[] = [];
    if (args.spinSpeed !== undefined) parts.push("adjusted motion");
    if (args.distort !== undefined) parts.push("changed the shape");
    if (args.color !== undefined) parts.push("updated the color");
    if (args.floatIntensity !== undefined) parts.push("changed float intensity");

    return parts.length
      ? `Scene updated — ${parts.join(", ")}.`
      : "Scene controls updated.";
  }, []);

  const value = useMemo(
    () => ({ controls, applySceneControl }),
    [controls, applySceneControl]
  );

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useSceneControls() {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error("useSceneControls must be used within SceneProvider");
  }
  return ctx;
}
