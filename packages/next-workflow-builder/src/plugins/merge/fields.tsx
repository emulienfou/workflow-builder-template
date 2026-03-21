"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "../../client/components/ui/button";
import { Label } from "../../client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../client/components/ui/select";
import { TemplateBadgeInput } from "../../client/components/ui/template-badge-input";

function MergeFields({
  config,
  onUpdateConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}) {
  const mode = (config?.mode as string) || "append";
  const inputCount = Number(config?.inputCount) || 2;

  const addInput = () => {
    onUpdateConfig("inputCount", String(inputCount + 1));
  };

  const removeInput = () => {
    if (inputCount <= 2) return;
    const last = inputCount;
    onUpdateConfig(`input${last}`, "");
    onUpdateConfig("inputCount", String(inputCount - 1));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Select
          disabled={ disabled }
          onValueChange={ (value) => onUpdateConfig("mode", value) }
          value={ mode }
        >
          <SelectTrigger id="mode">
            <SelectValue placeholder="Select mode"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="append">Append</SelectItem>
            <SelectItem value="combineByPosition">Combine by Position</SelectItem>
            <SelectItem value="combineByFields">Combine by Fields</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          { mode === "append" && "Concatenate all lists into one." }
          { mode === "combineByPosition" && "Merge items at the same index from all inputs." }
          { mode === "combineByFields" && "Match and merge items based on a common field." }
        </p>
      </div>

      { Array.from({ length: inputCount }, (_, i) => (
        <div className="space-y-2" key={ i }>
          <Label htmlFor={ `input${i + 1}` }>Input { i + 1 }</Label>
          <TemplateBadgeInput
            disabled={ disabled }
            id={ `input${i + 1}` }
            onChange={ (value) => onUpdateConfig(`input${i + 1}`, value) }
            placeholder={ `e.g., {{Node.rows}}` }
            value={ (config?.[`input${i + 1}`] as string) || "" }
          />
          { i === 0 && (
            <p className="text-muted-foreground text-xs">
              Use @ to reference outputs from previous nodes.
            </p>
          ) }
        </div>
      )) }

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={ disabled }
          onClick={ addInput }
          type="button"
          variant="outline"
        >
          <Plus className="mr-2 size-4"/>
          Add Input
        </Button>
        <Button
          disabled={ disabled || inputCount <= 2 }
          onClick={ removeInput }
          type="button"
          variant="outline"
        >
          <Minus className="size-4"/>
        </Button>
      </div>

      { mode === "combineByPosition" && (
        <div className="space-y-2">
          <Label htmlFor="unmatchedHandling">When arrays have different lengths</Label>
          <Select
            disabled={ disabled }
            onValueChange={ (value) => onUpdateConfig("unmatchedHandling", value) }
            value={ (config?.unmatchedHandling as string) || "useNull" }
          >
            <SelectTrigger id="unmatchedHandling">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="useNull">Fill with null</SelectItem>
              <SelectItem value="discard">Discard extra items</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) }

      { mode === "combineByFields" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="matchField">Match Field</Label>
            <TemplateBadgeInput
              disabled={ disabled }
              id="matchField"
              onChange={ (value) => onUpdateConfig("matchField1", value) }
              placeholder="e.g., id"
              value={ (config?.matchField1 as string) || "" }
            />
            <p className="text-muted-foreground text-xs">
              Field name to match items on across all inputs.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinType">Join Type</Label>
            <Select
              disabled={ disabled }
              onValueChange={ (value) => onUpdateConfig("joinType", value) }
              value={ (config?.joinType as string) || "inner" }
            >
              <SelectTrigger id="joinType">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inner">Inner Join</SelectItem>
                <SelectItem value="leftOuter">Left Outer Join</SelectItem>
                <SelectItem value="rightOuter">Right Outer Join</SelectItem>
                <SelectItem value="fullOuter">Full Outer Join</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Inner keeps only matches. Left/Right keeps all items from that input. Full keeps everything.
            </p>
          </div>
        </>
      ) }
    </div>
  );
}

export { MergeFields };
