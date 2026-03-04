"use client";

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
          { mode === "append" && "Concatenate both lists into one." }
          { mode === "combineByPosition" && "Merge items at the same index from both inputs." }
          { mode === "combineByFields" && "Match and merge items based on a common field." }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="input1">Input 1</Label>
        <TemplateBadgeInput
          disabled={ disabled }
          id="input1"
          onChange={ (value) => onUpdateConfig("input1", value) }
          placeholder="e.g., {{PreviousNode.rows}}"
          value={ (config?.input1 as string) || "" }
        />
        <p className="text-muted-foreground text-xs">
          First array to merge. Use @ to reference outputs from previous nodes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="input2">Input 2</Label>
        <TemplateBadgeInput
          disabled={ disabled }
          id="input2"
          onChange={ (value) => onUpdateConfig("input2", value) }
          placeholder="e.g., {{AnotherNode.results}}"
          value={ (config?.input2 as string) || "" }
        />
        <p className="text-muted-foreground text-xs">
          Second array to merge. Use @ to reference outputs from previous nodes.
        </p>
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
            <Label htmlFor="matchField1">Match Field (Input 1)</Label>
            <TemplateBadgeInput
              disabled={ disabled }
              id="matchField1"
              onChange={ (value) => onUpdateConfig("matchField1", value) }
              placeholder="e.g., id"
              value={ (config?.matchField1 as string) || "" }
            />
            <p className="text-muted-foreground text-xs">
              Field name in Input 1 to match on.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchField2">Match Field (Input 2)</Label>
            <TemplateBadgeInput
              disabled={ disabled }
              id="matchField2"
              onChange={ (value) => onUpdateConfig("matchField2", value) }
              placeholder="e.g., id"
              value={ (config?.matchField2 as string) || "" }
            />
            <p className="text-muted-foreground text-xs">
              Field name in Input 2 to match on.
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
