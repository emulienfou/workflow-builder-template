/**
 * Executable step function for Merge action
 * Combines data from two input arrays using different strategies
 * Similar to n8n's Merge node
 */
import "server-only";

import { type StepInput, withStepLogging } from "../../server";

export type MergeMode = "append" | "combineByPosition" | "combineByFields";
export type JoinType = "inner" | "leftOuter" | "rightOuter" | "fullOuter";
export type UnmatchedHandling = "discard" | "useNull";

export type MergeInput = StepInput & {
  /** First input array */
  input1: unknown[];
  /** Second input array */
  input2: unknown[];
  /** Merge mode */
  mode?: MergeMode;
  /** Field name in input1 to match on (for combineByFields) */
  matchField1?: string;
  /** Field name in input2 to match on (for combineByFields) */
  matchField2?: string;
  /** Join type (for combineByFields) */
  joinType?: JoinType;
  /** How to handle unmatched items when arrays differ in length (for combineByPosition) */
  unmatchedHandling?: UnmatchedHandling;
};

export type MergeResult = {
  /** The merged output array */
  merged: unknown[];
  /** Total number of items in the merged result */
  totalItems: number;
};

function getField(item: unknown, field: string): unknown {
  if (item && typeof item === "object") {
    return (item as Record<string, unknown>)[field];
  }
  return undefined;
}

function mergeAppend(items1: unknown[], items2: unknown[]): MergeResult {
  const merged = [...items1, ...items2];
  return { merged, totalItems: merged.length };
}

function mergeByPosition(
  items1: unknown[],
  items2: unknown[],
  unmatchedHandling: UnmatchedHandling,
): MergeResult {
  const maxLength = Math.max(items1.length, items2.length);
  const useNull = unmatchedHandling !== "discard";
  const merged: unknown[] = [];

  for (let i = 0; i < maxLength; i++) {
    const item1 = items1[i];
    const item2 = items2[i];

    if (!useNull && (item1 === undefined || item2 === undefined)) {
      continue;
    }

    merged.push({
      ...(item1 && typeof item1 === "object" ? item1 : { input1: item1 ?? null }),
      ...(item2 && typeof item2 === "object" ? item2 : { input2: item2 ?? null }),
    });
  }

  return { merged, totalItems: merged.length };
}

function mergeByFields(
  items1: unknown[],
  items2: unknown[],
  field1: string,
  field2: string,
  joinType: JoinType,
): MergeResult {
  // Build a lookup map for input2
  const map2 = new Map<unknown, unknown[]>();
  for (const item of items2) {
    const key = getField(item, field2);
    if (!map2.has(key)) {
      map2.set(key, []);
    }
    map2.get(key)!.push(item);
  }

  const merged: unknown[] = [];
  const matchedKeys2 = new Set<unknown>();

  // Process input1 items
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

  // Add unmatched input2 items for right/full outer joins
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

function evaluateMerge(input: MergeInput): MergeResult {
  const items1 = Array.isArray(input.input1) ? input.input1 : [];
  const items2 = Array.isArray(input.input2) ? input.input2 : [];
  const mode = input.mode || "append";

  switch (mode) {
    case "append":
      return mergeAppend(items1, items2);

    case "combineByPosition":
      return mergeByPosition(items1, items2, input.unmatchedHandling || "useNull");

    case "combineByFields":
      return mergeByFields(
        items1,
        items2,
        input.matchField1 || "id",
        input.matchField2 || "id",
        input.joinType || "inner",
      );

    default:
      return mergeAppend(items1, items2);
  }
}

// biome-ignore lint/suspicious/useAwait: workflow "use step" requires async
export async function mergeStep(input: MergeInput): Promise<MergeResult> {
  "use step";
  return withStepLogging(input, () => Promise.resolve(evaluateMerge(input)));
}

mergeStep.maxRetries = 0;
