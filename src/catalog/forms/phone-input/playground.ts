import { definePlayground } from "../../spec.ts";

export default definePlayground<{ country: string }>({
  options: [{ key: "country", label: "Ülke kodu", default: "+90", options: [{ value: "", label: "yok" }, { value: "+90", label: "+90" }, { value: "+44", label: "+44" }, { value: "+1", label: "+1" }] }],
});
