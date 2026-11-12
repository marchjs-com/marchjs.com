// Showcase channels: every name and payload of the "Messaging" page in one place (a wrong name or payload does not
// compile). Parts of the page import only this file, never each other.
import { defineChannels, of } from "hadi-march/channel";

export interface Product { id: string; name: string; price: number }
export interface Sale { month: string; total: number }

export const ch = defineChannels({
  /** A product button: "add this". The cart decides what that means. */
  "cart.added": of<Product>(),
  "cart.cleared": of(),
  /** The cart's new state, sticky: the top bar badge (and a page opened later) reads the last one. */
  "cart.changed": of<{ count: number; items: Product[] }>({ sticky: true }),
  /** Monthly sales, sticky: the chart loads late and draws the latest at once. */
  "sales.updated": of<Sale[]>({ sticky: true }),
  /** A bar of the chart was clicked (null: no filter). */
  "chart.select": of<{ month: string } | null>({ sticky: true }),
  /** Notes between tabs of this browser; the last 10 are kept for a tab opened later. */
  "tabs.note": of<{ text: string; tab: string }>({ crossTab: true, replay: 10 }),
  /** Per widget copy (<ChannelScope>): two counters never hear each other. */
  "counter.bump": of<number>({ scoped: true, sticky: true }),
});
