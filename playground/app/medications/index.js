import schema from "./schema";
import uiSchema from "./uiSchema";

export default {
  schema,
  uiSchema,
  formData: { medications: [{ useGeneric: false }] },
};
