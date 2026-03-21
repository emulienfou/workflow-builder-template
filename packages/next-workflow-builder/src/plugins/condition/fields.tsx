"use client";

import { Label } from "../../client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../client/components/ui/select";
import { TemplateBadgeInput } from "../../client/components/ui/template-badge-input";
import { DATA_TYPE_OPTIONS, type DataType, OPERATORS } from "./operators";

function ConditionFields({
  config,
  onUpdateConfig,
  onUpdateMultipleConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  onUpdateMultipleConfig?: (updates: Record<string, string>) => void;
  disabled: boolean;
}) {
  const dataType = (config?.dataType as DataType) || "string";
  const operator = (config?.operator as string) || OPERATORS[dataType][0].value;
  const operatorDefs = OPERATORS[dataType];
  const selectedOp = operatorDefs.find((op) => op.value === operator);
  const isUnary = selectedOp?.unary ?? false;

  function handleDataTypeChange(value: string) {
    // Reset operator to first of new type
    const newOps = OPERATORS[value as DataType];
    const newOperator = newOps?.[0]?.value ?? "";

    if (onUpdateMultipleConfig) {
      // Batch both updates to avoid stale state
      onUpdateMultipleConfig({ dataType: value, operator: newOperator });
    } else {
      onUpdateConfig("dataType", value);
      if (newOperator) {
        onUpdateConfig("operator", newOperator);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leftValue">Value to Test</Label>
        <TemplateBadgeInput
          disabled={ disabled }
          id="leftValue"
          onChange={ (value) => onUpdateConfig("leftValue", value) }
          placeholder="e.g., {{PreviousNode.status}}"
          value={ (config?.leftValue as string) || "" }
        />
        <p className="text-muted-foreground text-xs">
          Use @ to reference previous node outputs.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataType">Data Type</Label>
        <Select
          disabled={ disabled }
          onValueChange={ handleDataTypeChange }
          value={ dataType }
        >
          <SelectTrigger id="dataType">
            <SelectValue placeholder="Select data type"/>
          </SelectTrigger>
          <SelectContent>
            { DATA_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={ opt.value } value={ opt.value }>{ opt.label }</SelectItem>
            )) }
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select
          disabled={ disabled }
          onValueChange={ (value) => onUpdateConfig("operator", value) }
          value={ operator }
        >
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator"/>
          </SelectTrigger>
          <SelectContent>
            { operatorDefs.map((op) => (
              <SelectItem key={ op.value } value={ op.value }>{ op.label }</SelectItem>
            )) }
          </SelectContent>
        </Select>
      </div>

      { !isUnary && (
        <div className="space-y-2">
          <Label htmlFor="rightValue">Compare Value</Label>
          <TemplateBadgeInput
            disabled={ disabled }
            id="rightValue"
            onChange={ (value) => onUpdateConfig("rightValue", value) }
            placeholder="e.g., 200 or {{OtherNode.field}}"
            value={ (config?.rightValue as string) || "" }
          />
        </div>
      ) }
    </div>
  );
}

export { ConditionFields };
