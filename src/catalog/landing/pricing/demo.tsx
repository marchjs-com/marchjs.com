// Showcase stage for Pricing: switch monthly / yearly to see the prices roll.
import { Pricing, type PricingPlan } from "march/components/landing/pricing";

export const code = `let $period = "monthly"
<Pricing bind:period={$period} saving="4 ay bedava" currency="TRY" plans={[
  { name: "HADİ", price: 0, features: ["Etkinlik keşfet ve katıl", "Sohbet"], cta: { label: "Ücretsiz katıl" } },
  { name: "HADİ Premium", price: { monthly: 999, yearly: 7999 / 12 }, featured: true, badge: "Premium", features: […], cta: { label: "Premium'a geç" } },
]} />`

export const PLANS: PricingPlan[] = [
  { name: "HADİ", description: "Herkes için, ücretsiz.", price: 0, features: ["Etkinlik keşfet ve katıl", "Sohbet ve görüntülü görüşme", "Akış ve hikâyeler", { label: "Reklamsız", included: false }], cta: { label: "Ücretsiz katıl" } },
  { name: "HADİ Premium", description: "Daha fazlasını isteyenler için. Yıllık ödemede 7.999 TL.", price: { monthly: 999, yearly: 7999 / 12 }, featured: true, badge: "Premium", features: ["Reklamsız", "Öne çıkan profil", "Gelişmiş filtreler", "Etkinliklerde öncelik"], cta: { label: "Premium'a geç" } },
]

// a third plan with a custom price ("Custom"): shown when the sample count is 3
const CUSTOM: PricingPlan = { name: "Kurumsal", description: "Ekipler ve topluluklar için.", price: null, features: ["Toplu bilet", "Ekip panosu"], cta: { label: "Bize ulaşın" } }

export default function PricingDemo(props: { values: { sample: number; currency: string; saving: boolean; color: string; featureIcon: string; priceEffect: string } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      const plans = [...PLANS, CUSTOM].slice(0, v.sample)
      return <Pricing plans={plans} currency={v.currency} saving={v.saving ? "4 ay bedava" : undefined}
        m:color={v.color === "default" ? undefined : v.color as "brand-purple"} priceEffect={v.priceEffect as "roll"}
        featureIcon={v.featureIcon === "off" ? false : v.featureIcon === "own" ? (on: boolean) => <span class="m-muted">{on ? "+" : "–"}</span> : true} />
    }}
  </div>
}
