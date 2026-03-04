import { Merge } from "lucide-react";
import { ActionType } from "../../client/components/workflow/config/action-grid";

const mergeAction: ActionType = {
  id: "Merge",
  label: "Merge",
  description: "Combine data from two inputs",
  category: "System",
  icon: <Merge className="size-12 text-orange-300" strokeWidth={ 1.5 }/>,
  codeGenerator: `export async function mergeStep(input: {
  input1: unknown[];
  input2: unknown[];
  mode: "append" | "combineByPosition" | "combineByFields";
  matchField1?: string;
  matchField2?: string;
  joinType?: "inner" | "leftOuter" | "rightOuter" | "fullOuter";
  unmatchedHandling?: "discard" | "useNull";
}) {
  "use step";

  const items1 = Array.isArray(input.input1) ? input.input1 : [];
  const items2 = Array.isArray(input.input2) ? input.input2 : [];
  const mode = input.mode || "append";

  if (mode === "append") {
    const merged = [...items1, ...items2];
    return { merged, totalItems: merged.length };
  }

  if (mode === "combineByPosition") {
    const maxLength = Math.max(items1.length, items2.length);
    const useNull = input.unmatchedHandling !== "discard";
    const merged = [];
    for (let i = 0; i < maxLength; i++) {
      const item1 = items1[i];
      const item2 = items2[i];
      if (!useNull && (item1 === undefined || item2 === undefined)) continue;
      merged.push({
        ...(item1 && typeof item1 === "object" ? item1 : { input1: item1 ?? null }),
        ...(item2 && typeof item2 === "object" ? item2 : { input2: item2 ?? null }),
      });
    }
    return { merged, totalItems: merged.length };
  }

  if (mode === "combineByFields") {
    const field1 = input.matchField1 || "id";
    const field2 = input.matchField2 || "id";
    const joinType = input.joinType || "inner";
    const getField = (item: unknown, field: string) =>
      item && typeof item === "object" ? (item as Record<string, unknown>)[field] : undefined;

    const map2 = new Map<unknown, unknown[]>();
    for (const item of items2) {
      const key = getField(item, field2);
      if (!map2.has(key)) map2.set(key, []);
      map2.get(key)!.push(item);
    }

    const merged: unknown[] = [];
    const matchedKeys2 = new Set<unknown>();

    for (const item1 of items1) {
      const key = getField(item1, field1);
      const matches = map2.get(key);
      if (matches && matches.length > 0) {
        matchedKeys2.add(key);
        for (const item2 of matches) {
          merged.push({
            ...(typeof item1 === "object" ? item1 : {}),
            ...(typeof item2 === "object" ? item2 : {}),
          });
        }
      } else if (joinType === "leftOuter" || joinType === "fullOuter") {
        merged.push({ ...(typeof item1 === "object" ? item1 : {}) });
      }
    }

    if (joinType === "rightOuter" || joinType === "fullOuter") {
      for (const item2 of items2) {
        const key = getField(item2, field2);
        if (!matchedKeys2.has(key)) {
          merged.push({ ...(typeof item2 === "object" ? item2 : {}) });
        }
      }
    }

    return { merged, totalItems: merged.length };
  }

  return { merged: [...items1, ...items2], totalItems: items1.length + items2.length };
}`,
};

export { mergeAction };
