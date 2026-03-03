import { Repeat } from "lucide-react";
import { ActionType } from "../../client/components/workflow/config/action-grid";

const loopAction: ActionType = {
  id: "Loop",
  label: "Loop",
  description: "Loop through a list of items",
  category: "System",
  icon: <Repeat className="size-12 text-cyan-300" strokeWidth={ 1.5 }/>,
  codeGenerator: `export async function loopStep(input: {
  items: unknown[];
  batchSize?: number;
  currentBatchIndex?: number;
}) {
  "use step";

  const items = Array.isArray(input.items) ? input.items : [];
  const batchSize = Math.max(1, input.batchSize || 1);
  const currentBatchIndex = input.currentBatchIndex ?? 0;
  const totalItems = items.length;
  const totalBatches = Math.ceil(totalItems / batchSize);

  const startIndex = currentBatchIndex * batchSize;
  const endIndex = Math.min(startIndex + batchSize, totalItems);
  const currentBatch = items.slice(startIndex, endIndex);

  return {
    hasMore: currentBatchIndex < totalBatches - 1,
    currentBatchIndex,
    currentBatch,
    currentItem: currentBatch[0],
    currentIndex: startIndex,
    totalItems,
    totalBatches,
    items,
    batchSize,
  };
}`,
};

export { loopAction };
