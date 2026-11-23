// Showcase stage for DevicePicker: choose a device; its silhouette and size show beside the list.
import { signal } from "march";
import { DevicePicker, deviceById } from "march/layout";

export const code = `const $device = signal("iphone-15"), $land = signal(false)
<DevicePicker value={$device} landscape={$land} fit />`

export default function DevicePickerDemo(props: { values: { group: string; fit: boolean; search: boolean; create: boolean; landscape: boolean } }) {
  const device = signal("iphone-15"), land = signal(false)
  return <div class="sc-col" sx={{ gap: 3 }}>
    {() => <DevicePicker value={device} landscape={props.values.landscape ? land : undefined} group={props.values.group as "all"} fit={props.values.fit} search={props.values.search} create={props.values.create} />}
    <span class="m-muted">{() => { const d = deviceById(device()); return d ? `${d.name} · ${land() ? `${d.height} × ${d.width}` : `${d.width} × ${d.height}`}` : "Panele sığdır" }}</span>
  </div>
}
