import { Attribute, Field, Builder } from "@form-builder/builder";
import {
  createAttributeComponent,
  createFieldComponent,
} from "@form-builder/builder/react";

import { useMemo } from "react";
import { z } from "zod";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const labelAttribute = new Attribute({
  name: "label",
  validate: (value) => z.string().min(3).parse(value),
});
const LabelAttribute = createAttributeComponent(
  labelAttribute,
  ({ value, onValueChange, error }) => {
    return (
      <div className="space-y-1">
        <Label>Label</Label>
        <Input value={value} onChange={(e) => onValueChange(e.target.value)} />
        <ValidationError error={error} />
      </div>
    );
  }
);

const requiredAttribute = new Attribute({
  name: "required",
  validate: (value) => z.boolean().default(false).parse(value),
});
const RequiredAttribute = createAttributeComponent(
  requiredAttribute,
  ({ value, onValueChange, fieldId, attribute }) => {
    const id = `${fieldId}-${attribute.name}`;
    return (
      <Label htmlFor={id} className="flex items-center gap-2">
        <Checkbox id={id} checked={value} onCheckedChange={onValueChange} />
        Required
      </Label>
    );
  }
);

const textField = new Field({
  name: "text",
  attributes: [labelAttribute, requiredAttribute],
  validate: (value) => z.string().parse(value),
});
const TextField = createFieldComponent(textField, ({ fieldId, attributes }) => {
  return (
    <div className="space-y-1">
      <Label>
        {attributes.label}{" "}
        {attributes.required && <span className="text-red-500">*</span>}
      </Label>
      <Input />
    </div>
  );
});

const checkboxField = new Field({
  name: "checkbox",
  attributes: [labelAttribute],
  validate: (value) => z.boolean().parse(value),
});

const CheckboxField = createFieldComponent(
  checkboxField,
  ({ fieldId, attributes }) => {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id={fieldId} />
        <Label htmlFor={fieldId}>{attributes.label}</Label>
      </div>
    );
  }
);

const ValidationError = ({ error }: { error: Error | null }) => {
  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }

    if (error instanceof z.ZodError) {
      return error.issues[0]?.message;
    }

    return error.message;
  }, [error]);

  return <p className="text-destructive text-sm">{errorMessage}</p>;
};

const builder = new Builder({
  fields: [textField, checkboxField],
});

export {
  LabelAttribute,
  RequiredAttribute,
  TextField,
  CheckboxField,
  ValidationError,
  builder,
};
