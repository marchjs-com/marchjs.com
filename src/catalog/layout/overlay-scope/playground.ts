import { definePlayground } from "../../spec.ts";

interface Values { target: string; content: string }

export default definePlayground<Values>({
  options: [
    { key: "target", label: "Çekmece nerede açılsın", default: "nearest", options: [{ value: "nearest", label: "bu kutuda" }, { value: "page", label: "sayfada" }], prop: false },
    { key: "content", label: "İçerik", default: "Çekmece ve pencere bu kutunun içinde açılır.", kind: "text", prop: "children" },
  ],
});
