// A topic page of a section (src/topics/<section>.ts, gathered in src/topics.ts).
export interface Topic { slug: string; title: string; /** The March name of the component(s) the page shows ("Newsletter"): the menu writes it under the title. */ name?: string; desc: string; group: string; /** Menu parent when it is not the section (a kind of sample app). */ parent?: string }
