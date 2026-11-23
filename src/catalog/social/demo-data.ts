// Neutral demo data shared by the social component demos (showcase only): communities and handles, never real people.
// Images are the abstract SVG scenes the site serves under media/social/.
import type { MediaItem } from "march/social";
import { appUrl } from "march/base";

/** A scene under the app's root, on every route (appUrl: a relative path would resolve against the route). */
export const PHOTO = (name: string): string => appUrl(`media/social/${name}.svg`);

export const PHOTOS: readonly MediaItem[] = [
  { src: PHOTO("sunset"), alt: "Tepelerin üstünde gün batımı", width: 1200, height: 1500 },
  { src: PHOTO("sea"), alt: "Mavi denizde turuncu yelkenli", width: 1500, height: 1000 },
  { src: PHOTO("forest"), alt: "Orman yolu", width: 1200, height: 1500 },
  { src: PHOTO("city"), alt: "Gece şehir ışıkları", width: 1500, height: 1000 },
  { src: PHOTO("coffee"), alt: "Üstten kahve fincanı", width: 1200, height: 1200 },
  { src: PHOTO("ride"), alt: "Bisiklet çizimi", width: 1500, height: 1000 },
  { src: PHOTO("dawn"), alt: "Şafakta dağlar", width: 1080, height: 1920 },
  { src: PHOTO("confetti"), alt: "Dört renkli konfeti", width: 1080, height: 1920 },
];

export interface DemoUser { id: string; name: string; handle: string; verified?: boolean }
export const USERS: readonly DemoUser[] = [
  { id: "u1", name: "HADİ Koşu Kulübü", handle: "hadi.kosu", verified: true },
  { id: "u2", name: "Pazar Bisiklet Grubu", handle: "pazar.bisiklet" },
  { id: "u3", name: "Fotoğraf Atölyesi", handle: "foto.atolye", verified: true },
  { id: "u4", name: "Kitap Kulübü", handle: "kitap.kulubu" },
  { id: "u5", name: "Sahil Yürüyüşçüleri", handle: "sahil.yuruyus" },
  { id: "u6", name: "Masa Oyunları Ekibi", handle: "masa.oyun" },
  { id: "me", name: "Siz", handle: "siz" },
];
export const user = (id: string): DemoUser => USERS.find((u) => u.id === id) ?? (USERS[0] as DemoUser);

export const minutesAgo = (m: number): Date => new Date(Date.now() - m * 60_000);
