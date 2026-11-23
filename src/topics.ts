// Section pages with one page per topic (/editors/terminal, /forms/select…): the overview at /<section> shows the
// topics as grouped cards, the side menu lists them under the section, Ctrl+K finds them. Titles, one-line
// descriptions and groups only (start-up needs the titles for the breadcrumb); each page module draws its topics.
// Each section's list is its own file (src/topics/<section>.ts): a section page loads only its own.
import type { Topic } from "./topics/types.ts";
import { TOPICS as editors } from "./topics/editors.ts";
import { TOPICS as forms } from "./topics/forms.ts";
import { TOPICS as data } from "./topics/data.ts";
import { TOPICS as bigData } from "./topics/big-data.ts";
import { TOPICS as feedback } from "./topics/feedback.ts";
import { TOPICS as navigation } from "./topics/navigation.ts";
import { TOPICS as social } from "./topics/social.ts";
import { TOPICS as layout } from "./topics/layout.ts";
import { TOPICS as buttons } from "./topics/buttons.ts";
import { TOPICS as text } from "./topics/text.ts";
import { TOPICS as overlays } from "./topics/overlays.ts";
import { TOPICS as themes } from "./topics/themes.ts";
import { TOPICS as overlay } from "./topics/overlay.ts";
import { TOPICS as motion } from "./topics/motion.ts";
import { TOPICS as animation } from "./topics/animation.ts";
import { TOPICS as charts } from "./topics/charts.ts";
import { TOPICS as speed } from "./topics/speed.ts";
import { TOPICS as network } from "./topics/network.ts";
import { TOPICS as seo } from "./topics/seo.ts";
import { TOPICS as ideShell } from "./topics/ide-shell.ts";
import { TOPICS as language } from "./topics/language.ts";
import { TOPICS as managers } from "./topics/managers.ts";
import { TOPICS as managersData } from "./topics/managers-data.ts";
import { TOPICS as managersOps } from "./topics/managers-ops.ts";
import { TOPICS as managersA11y } from "./topics/managers-a11y.ts";
import { TOPICS as managersEnv } from "./topics/managers-env.ts";
import { TOPICS as web } from "./topics/web.ts";
import { TOPICS as sites, SITE_KINDS } from "./topics/sites.ts";

export type { Topic } from "./topics/types.ts";
export { SITE_KINDS };

export const HUBS: Record<string, readonly Topic[]> = {
  "/editors": editors,
  "/forms": forms,
  "/data": data,
  "/big-data": bigData,
  "/feedback": feedback,
  "/navigation": navigation,
  "/social": social,
  "/layout": layout,
  "/buttons": buttons,
  "/text": text,
  "/overlays": overlays,
  "/themes": themes,
  "/overlay": overlay,
  "/motion": motion,
  "/animation": animation,
  "/charts": charts,
  "/speed": speed,
  "/network": network,
  "/seo": seo,
  "/ide-shell": ideShell,
  "/language": language,
  "/managers": managers,
  "/managers-data": managersData,
  "/managers-ops": managersOps,
  "/managers-a11y": managersA11y,
  "/managers-env": managersEnv,
  "/web": web,
  "/sites": sites,
};

/** Every topic as a sub page under its section (path, title, parent) for the routes, the breadcrumb and the menu. */
export const TOPIC_PAGES = [
  ...SITE_KINDS.map((k) => ({ path: `/sites/${k.slug}`, title: k.title, parent: "/sites", desc: k.desc })),
  ...Object.entries(HUBS).flatMap(([base, list]) => list.map((t) => ({ path: `${base}/${t.slug}`, title: t.title, parent: t.parent ?? base, desc: t.desc, name: t.name }))),
];
