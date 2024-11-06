import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

import { Pencil1Icon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  useBuilderFields,
  useBuilderAttributes,
  renderComponent,
} from "@form-builder/builder/react";

import {
  builder,
  CheckboxField,
  LabelAttribute,
  RequiredAttribute,
  TextField,
} from "~/lib/form";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: z.object({
    fieldId: z.string().optional(),
  }),
});

function HomeComponent() {
  const navigate = Route.useNavigate();
  const { fieldId } = Route.useSearch();

  const fields = useBuilderFields(builder, {
    text: TextField,
    checkbox: CheckboxField,
  });

  const attributes = useBuilderAttributes(builder, fieldId!, {
    label: LabelAttribute,
    required: RequiredAttribute,
  });

  return (
    <div className="w-full flex">
      <aside className="h-screen border-r w-64 p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              builder.append({
                type: "text",
                attributes: {
                  label: "Text Input",
                },
              });
            }}
          >
            Text Input
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              builder.append({
                type: "checkbox",
                attributes: {
                  label: "Checkbox",
                },
              });
            }}
          >
            Checkbox
          </Button>
        </div>
      </aside>

      <div className="max-w-lg w-full space-y-4 p-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center gap-1 w-full">
            <div className="flex-1">{renderComponent(field)}</div>

            <Button
              className="self-end"
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate({ search: { fieldId: field.id } });
              }}
            >
              <Pencil1Icon />
            </Button>
          </div>
        ))}
      </div>

      <Sheet
        open={!!fieldId}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ search: {} });
          }
        }}
      >
        <SheetContent side="right" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Field Settings</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5 pt-1">
            {attributes.map((attribute) => (
              <div key={attribute.id}>{renderComponent(attribute)}</div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
