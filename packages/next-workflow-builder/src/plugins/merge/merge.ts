/**
 * Executable step function for Merge action
 * Combines data from multiple input arrays using different strategies
 * Similar to n8n's Merge node
 */
import "server-only";

import { type StepInput, withStepLogging } from "../../server";

export type MergeMode = "append" | "combineByPosition" | "combineByFields";
export type JoinType = "inner" | "leftOuter" | "rightOuter" | "fullOuter";
export type UnmatchedHandling = "discard" | "useNull";

export type MergeInput = StepInput & {
  /** Dynamic inputs: input1, input2, ... inputN */
  [key: string]: unknown;
  /** Number of inputs (default 2 for backwards compatibility) */
  inputCount?: number;
  /** Merge mode */
  mode?: MergeMode;
  /** Field name to match on (for combineByFields) */
  matchField1?: string;
  /** Field name in input2 to match on (for combineByFields, backwards compat) */
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

function collectInputs(input: MergeInput): unknown[][] {
  const count = Number(input.inputCount) || 2;
  const inputs: unknown[][] = [];
  for (let i = 1; i <= count; i++) {
    const val = input[`input${i}`];
    inputs.push(Array.isArray(val) ? val : []);
  }
  return inputs;
}

function mergeAppend(inputs: unknown[][]): MergeResult {
  const merged = inputs.flat();
  return { merged, totalItems: merged.length };
}

function mergeByPosition(
  inputs: unknown[][],
  unmatchedHandling: UnmatchedHandling,
): MergeResult {
  const maxLength = Math.max(...inputs.map((arr) => arr.length));
  const useNull = unmatchedHandling !== "discard";
  const merged: unknown[] = [];

  for (let i = 0; i < maxLength; i++) {
    if (!useNull && inputs.some((arr) => arr[i] === undefined)) {
      continue;
    }

    const combined: Record<string, unknown> = {};
    for (let j = 0; j < inputs.length; j++) {
      const item = inputs[j][i];
      if (item && typeof item === "object") {
        Object.assign(combined, item);
      } else {
        combined[`input${j + 1}`] = item ?? null;
      }
    }
    merged.push(combined);
  }

  return { merged, totalItems: merged.length };
}

function mergeByFields(
  inputs: unknown[][],
  matchField: string,
  joinType: JoinType,
): MergeResult {
  if (inputs.length < 2) {
    return { merged: inputs[0] || [], totalItems: inputs[0]?.length || 0 };
  }

  // Start with the first input and progressively merge each subsequent input
  let current = inputs[0];

  for (let idx = 1; idx < inputs.length; idx++) {
    const next = inputs[idx];
    const map = new Map<unknown, unknown[]>();
    for (const item of next) {
      const key = getField(item, matchField);
      if (!map.has(key)) {
        map.set(key, []);
      }
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
      for (const item2 of next) {
        const key = getField(item2, matchField);
        if (!matchedKeys.has(key)) {
          merged.push({ ...(typeof item2 === "object" ? item2 : {}) });
        }
      }
    }

    current = merged;
  }

  return { merged: current, totalItems: current.length };
}

function evaluateMerge(input: MergeInput): MergeResult {
  const inputs = collectInputs(input);
  const mode = input.mode || "append";

  switch (mode) {
    case "append":
      return mergeAppend(inputs);

    case "combineByPosition":
      return mergeByPosition(inputs, input.unmatchedHandling || "useNull");

    case "combineByFields":
      return mergeByFields(
        inputs,
        input.matchField1 || "id",
        input.joinType || "inner",
      );

    default:
      return mergeAppend(inputs);
  }
}

// biome-ignore lint/suspicious/useAwait: workflow "use step" requires async
export async function mergeStep(input: MergeInput): Promise<MergeResult> {
  "use step";
  return withStepLogging(input, () => Promise.resolve(evaluateMerge(input)));
}

mergeStep.maxRetries = 0;
