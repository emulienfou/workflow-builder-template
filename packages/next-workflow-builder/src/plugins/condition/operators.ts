/**
 * Shared operator definitions for structured conditions.
 * Used by both the UI (fields.tsx) and server (workflow-executor).
 */

export type DataType = "string" | "number" | "boolean" | "datetime";

export type OperatorDef = {
  value: string;
  label: string;
  /** If true, no right-hand value is needed */
  unary: boolean;
};

export const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "datetime", label: "Date & Time" },
];

export const OPERATORS: Record<DataType, OperatorDef[]> = {
  string: [
    { value: "exists", label: "exists", unary: true },
    { value: "doesNotExist", label: "does not exist", unary: true },
    { value: "isEmpty", label: "is empty", unary: true },
    { value: "isNotEmpty", label: "is not empty", unary: true },
    { value: "equals", label: "equals", unary: false },
    { value: "notEquals", label: "does not equal", unary: false },
    { value: "contains", label: "contains", unary: false },
    { value: "doesNotContain", label: "does not contain", unary: false },
    { value: "startsWith", label: "starts with", unary: false },
    { value: "doesNotStartWith", label: "does not start with", unary: false },
    { value: "endsWith", label: "ends with", unary: false },
    { value: "doesNotEndWith", label: "does not end with", unary: false },
    { value: "matchesRegex", label: "matches regex", unary: false },
    { value: "doesNotMatchRegex", label: "does not match regex", unary: false },
  ],
  number: [
    { value: "equals", label: "equals", unary: false },
    { value: "notEquals", label: "does not equal", unary: false },
    { value: "greaterThan", label: "greater than", unary: false },
    { value: "lessThan", label: "less than", unary: false },
    { value: "greaterThanOrEqual", label: "greater than or equal", unary: false },
    { value: "lessThanOrEqual", label: "less than or equal", unary: false },
  ],
  boolean: [
    { value: "isTrue", label: "is true", unary: true },
    { value: "isFalse", label: "is false", unary: true },
    { value: "exists", label: "exists", unary: true },
    { value: "doesNotExist", label: "does not exist", unary: true },
  ],
  datetime: [
    { value: "isBefore", label: "is before", unary: false },
    { value: "isAfter", label: "is after", unary: false },
    { value: "equals", label: "equals", unary: false },
  ],
};

/**
 * Evaluate a structured condition operator.
 * Pure function — no side effects, no template resolution.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Operator evaluation covers many cases by design
export function evaluateOperator(
  dataType: DataType,
  operator: string,
  leftValue: unknown,
  rightValue: unknown,
): boolean {
  // --- Unary operators (type-independent) ---
  switch (operator) {
    case "exists":
      return leftValue !== null && leftValue !== undefined;
    case "doesNotExist":
      return leftValue === null || leftValue === undefined;
    case "isEmpty":
      return leftValue === null || leftValue === undefined || String(leftValue) === "";
    case "isNotEmpty":
      return leftValue !== null && leftValue !== undefined && String(leftValue) !== "";
    case "isTrue":
      return Boolean(leftValue) === true;
    case "isFalse":
      return Boolean(leftValue) === false;
  }

  // --- Binary operators by data type ---
  switch (dataType) {
    case "string": {
      const left = String(leftValue ?? "");
      const right = String(rightValue ?? "");
      switch (operator) {
        case "equals": return left === right;
        case "notEquals": return left !== right;
        case "contains": return left.includes(right);
        case "doesNotContain": return !left.includes(right);
        case "startsWith": return left.startsWith(right);
        case "doesNotStartWith": return !left.startsWith(right);
        case "endsWith": return left.endsWith(right);
        case "doesNotEndWith": return !left.endsWith(right);
        case "matchesRegex":
          try { return new RegExp(right).test(left); } catch { return false; }
        case "doesNotMatchRegex":
          try { return !new RegExp(right).test(left); } catch { return false; }
      }
      break;
    }

    case "number": {
      const left = Number(leftValue);
      const right = Number(rightValue);
      if (Number.isNaN(left) || Number.isNaN(right)) return false;
      switch (operator) {
        case "equals": return left === right;
        case "notEquals": return left !== right;
        case "greaterThan": return left > right;
        case "lessThan": return left < right;
        case "greaterThanOrEqual": return left >= right;
        case "lessThanOrEqual": return left <= right;
      }
      break;
    }

    case "boolean":
      // All boolean operators are unary — handled above
      break;

    case "datetime": {
      const left = new Date(leftValue as string).getTime();
      const right = new Date(rightValue as string).getTime();
      if (Number.isNaN(left) || Number.isNaN(right)) return false;
      switch (operator) {
        case "isBefore": return left < right;
        case "isAfter": return left > right;
        case "equals": return left === right;
      }
      break;
    }
  }

  console.warn(`[Condition] Unknown operator "${operator}" for data type "${dataType}"`);
  return false;
}
