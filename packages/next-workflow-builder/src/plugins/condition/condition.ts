/**
 * Executable step function for Condition action
 */
import "server-only";

import { type StepInput, withStepLogging } from "../../server";
import type { DataType } from "./operators";

export type ConditionInput = StepInput & {
  condition: boolean;
  /** Structured condition fields for logging */
  dataType?: DataType;
  operator?: string;
  leftValue?: unknown;
  rightValue?: unknown;
};

type ConditionResult = {
  condition: boolean;
};

function evaluateCondition(input: ConditionInput): ConditionResult {
  return { condition: input.condition };
}

// biome-ignore lint/suspicious/useAwait: workflow "use step" requires async
export async function conditionStep(
  input: ConditionInput,
): Promise<ConditionResult> {
  "use step";
  return withStepLogging(input, () =>
    Promise.resolve(evaluateCondition(input)),
  );
}

conditionStep.maxRetries = 0;
