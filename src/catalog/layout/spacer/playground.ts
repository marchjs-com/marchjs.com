import { definePlayground } from "../../spec.ts";

interface Values { spacer: boolean }

export default definePlayground<Values>({
  options: [
    { key: "spacer", label: "Spacer", default: true, prop: false },
  ],
});
