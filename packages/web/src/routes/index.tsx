import { createFileRoute } from "@tanstack/react-router";
import {
  BuilderFields,
  BuilderAttributes,
  createAttribute,
  createAttributeComponent,
  createConfig,
  createField,
  createFieldComponent,
  useBuilder,
} from "~/components/form-elements";
import { z } from "zod";

import { Sheet, SheetContent } from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Cross1Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { Checkbox } from "~/components/ui/checkbox";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: z.object({
    fieldId: z.string().optional(),
  }),
});

function HomeComponent() {
  const builder = useBuilder(form);

  const navigate = Route.useNavigate();

  const { fieldId } = Route.useSearch();

  return (
    <div className="w-full flex">
      <aside className="h-screen border-r w-64 p-4">
        <Button
          variant="outline"
          onClick={() => {
            builder.append({
              name: "text",
              attributes: {
                label: "Text Input",
              },
            });
          }}
        >
          Text Input
        </Button>
      </aside>

      <div className="max-w-lg w-full space-y-4 p-4">
        <BuilderFields
          builder={builder}
          components={[TextField]}
          wrap={({ children, id }) => (
            <div className="flex items-end gap-2">
              <div className="flex-1">{children}</div>

              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate({ search: { fieldId: id } })}
              >
                <Pencil1Icon />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => builder.remove(id)}
              >
                <Cross1Icon />
              </Button>
            </div>
          )}
        />
      </div>

      <Sheet
        open={!!fieldId}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ search: { fieldId: undefined } });
          }
        }}
      >
        <SheetContent side="right">
          <div className="space-y-4">
            <BuilderAttributes
              builder={builder}
              fieldId={fieldId!}
              components={[LabelAttribute, RequiredAttribute]}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const requiredAttribute = createAttribute({
  name: "required",
  validate: (value) => z.boolean().parse(value),
});

const RequiredAttribute = createAttributeComponent(
  requiredAttribute,
  ({ value, onValueChange }) => {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={value} onCheckedChange={onValueChange} />
        <Label
          htmlFor="terms"
          className=" leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Required
        </Label>
      </div>
    );
  }
);

const labelAttribute = createAttribute({
  name: "label",
  validate: (value) => z.string().parse(value),
});

const LabelAttribute = createAttributeComponent(
  labelAttribute,
  ({ value, onValueChange }) => {
    return (
      <div className="space-y-1">
        <Label>Label</Label>
        <Input value={value} onChange={(e) => onValueChange(e.target.value)} />
      </div>
    );
  }
);

const textField = createField({
  name: "text",
  attributes: [labelAttribute, requiredAttribute],
  validate: (value) => z.string().parse(value),
});

const TextField = createFieldComponent(
  textField,
  ({ value, onValueChange, attributes }) => {
    return (
      <div className="space-y-1">
        <Label>
          {attributes.label}{" "}
          {attributes.required && <span className="text-red-500">*</span>}
        </Label>
        <Input />
      </div>
    );
  }
);

const form = createConfig({
  fields: [textField],
});
