// Page transitions demo: the tiles of the shared-element grid.
export interface Tile { id: string; name: string; tone: number }
export const TILES: Tile[] = ["Elmas", "Akçe", "Sohbet", "Etkinlik", "Canlı", "Oyun"].map((name, i) => ({ id: String(i + 1), name, tone: i + 1 }));
