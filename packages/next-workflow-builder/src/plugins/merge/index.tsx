import { Merge } from "lucide-react";
import { ActionType } from "../../client/components/workflow/config/action-grid";

const mergeAction: ActionType = {
  id: "Merge",
  label: "Merge",
  description: "Combine data from multiple inputs",
  category: "System",
  icon: <Merge className="size-12 text-orange-300" strokeWidth={ 1.5 }/>,
  codeGenerator: `export async function mergeStep(input: {
  inputCount?: number;
  [key: string]: unknown;
  mode: "append" | "combineByPosition" | "combineByFields";
  matchField1?: string;
  joinType?: "inner" | "leftOuter" | "rightOuter" | "fullOuter";
  unmatchedHandling?: "discard" | "useNull";
}) {
  "use step";

  const count = Number(input.inputCount) || 2;
  const inputs: unknown[][] = [];
  for (let i = 1; i <= count; i++) {
    const val = (input as Record<string, unknown>)[\`input\${i}\`];
    inputs.push(Array.isArray(val) ? val : []);
  }
  const mode = input.mode || "append";

  if (mode === "append") {
    const merged = inputs.flat();
    return { merged, totalItems: merged.length };
  }

  if (mode === "combineByPosition") {
    const maxLength = Math.max(...inputs.map(arr => arr.length));
    const useNull = input.unmatchedHandling !== "discard";
    const merged = [];
    for (let i = 0; i < maxLength; i++) {
      if (!useNull && inputs.some(arr => arr[i] === undefined)) continue;
      const combined: Record<string, unknown> = {};
      for (let j = 0; j < inputs.length; j++) {
        const item = inputs[j][i];
        if (item && typeof item === "object") Object.assign(combined, item);
        else combined[\`input\${j + 1}\`] = item ?? null;
      }
      merged.push(combined);
    }
    return { merged, totalItems: merged.length };
  }

  if (mode === "combineByFields") {
    const matchField = input.matchField1 || "id";
    const joinType = input.joinType || "inner";
    const getField = (item: unknown, field: string) =>
      item && typeof item === "object" ? (item as Record<string, unknown>)[field] : undefined;

    let current = inputs[0];
    for (let idx = 1; idx < inputs.length; idx++) {
      const next = inputs[idx];
      const map = new Map<unknown, unknown[]>();
      for (const item of next) {
        const key = getField(item, matchField);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
      }
      const merged: unknown[] = [];
      const matchedKeys = new Set<unknown>();
      for (const item1 of current) {
        const key = getField(item1, matchField);
        const matches = map.get(key);
        if (matches && matches.length > 0) {
          matchedKeys.add(key);
          for (const item2 of matches) {
            merged.push({ ...(typeof item1 === "object" ? item1 : {}), ...(typeof item2 === "object" ? item2 : {}) });
          }
        } else if (joinType === "leftOuter" || joinType === "fullOuter") {
          merged.push({ ...(typeof item1 === "object" ? item1 : {}) });
        }
      }
      if (joinType === "rightOuter" || joinType === "fullOuter") {
        for (const item2 of next) {
          const key = getField(item2, matchField);
          if (!matchedKeys.has(key)) merged.push({ ...(typeof item2 === "object" ? item2 : {}) });
        }
      }
      current = merged;
    }
    return { merged: current, totalItems: current.length };
  }

  return { merged: inputs.flat(), totalItems: inputs.flat().length };
}`,
};

export { mergeAction };
