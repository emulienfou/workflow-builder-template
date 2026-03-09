import { GitBranch } from "lucide-react";
import { ActionType } from "../../client/components/workflow/config/action-grid";

const conditionAction: ActionType = {
  id: "Condition",
  label: "Condition",
  description: "Branch based on a condition",
  category: "System",
  icon: <GitBranch className="size-12 text-pink-300" strokeWidth={ 1.5 }/>,
  codeGenerator: `export async function conditionStep(input: {
  condition: boolean;
  dataType?: string;
  operator?: string;
  leftValue?: unknown;
  rightValue?: unknown;
}) {
  "use step";

  // Evaluate structured condition
  return { condition: input.condition };
}`,
};

export { conditionAction };
