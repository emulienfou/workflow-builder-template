// HTTP Request fields component
import { CodeEditor } from "../../client/components/ui/code-editor";
import { Label } from "../../client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../client/components/ui/select";
import { TemplateBadgeInput } from "../../client/components/ui/template-badge-input";

function HttpRequestFields({
  config,
  onUpdateConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="httpMethod">HTTP Method</Label>
        <Select
          disabled={ disabled }
          onValueChange={ (value) => onUpdateConfig("httpMethod", value) }
          value={ (config?.httpMethod as string) || "POST" }
        >
          <SelectTrigger className="w-full" id="httpMethod">
            <SelectValue placeholder="Select method"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="endpoint">URL</Label>
        <TemplateBadgeInput
          disabled={ disabled }
          id="endpoint"
          onChange={ (value) => onUpdateConfig("endpoint", value) }
          placeholder="https://api.example.com/endpoint or {{NodeName.url}}"
          value={ (config?.endpoint as string) || "" }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="httpHeaders">Headers (JSON)</Label>
        <div className="overflow-hidden rounded-md border">
          <CodeEditor
            defaultLanguage="json"
            height="100px"
            onChange={ (value) => onUpdateConfig("httpHeaders", value || "{}") }
            options={ {
              minimap: { enabled: false },
              lineNumbers: "off",
              scrollBeyondLastLine: false,
              fontSize: 12,
              readOnly: disabled,
              wordWrap: "off",
            } }
            value={ (config?.httpHeaders as string) || "{}" }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="httpBody">Body (JSON)</Label>
        <div
          className={ `overflow-hidden rounded-md border ${ config?.httpMethod === "GET" ? "opacity-50" : "" }` }
        >
          <CodeEditor
            defaultLanguage="json"
            height="120px"
            onChange={ (value) => onUpdateConfig("httpBody", value || "{}") }
            options={ {
              minimap: { enabled: false },
              lineNumbers: "off",
              scrollBeyondLastLine: false,
              fontSize: 12,
              readOnly: config?.httpMethod === "GET" || disabled,
              domReadOnly: config?.httpMethod === "GET" || disabled,
              wordWrap: "off",
            } }
            value={ (config?.httpBody as string) || "{}" }
          />
        </div>
        { config?.httpMethod === "GET" && (
          <p className="text-muted-foreground text-xs">
            Body is disabled for GET requests
          </p>
        ) }
      </div>
    </>
  );
}

export { HttpRequestFields };
