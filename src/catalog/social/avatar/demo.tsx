// Showcase stage for Avatar: a row of communities for the Playground values (playground.ts). The first one has a
// picture; "broken address" shows the fallback to the initials.
import { Avatar, type AvatarSize } from "march/social";
import { USERS, PHOTO } from "../demo-data.ts";
import { user } from "march/icons";

export const code = `<Avatar name="Ada Lovelace" src={url} size="lg" />        // initials when there is no image or it fails
<Avatar name="Linus Torvalds" color="brand-orange" shape="square" />
<Avatar text="+3" color="neutral" />   <Avatar icon={user} label="Guest" />
<Avatar name={u.name} decorative />                        // the name is written next to it`

export default function AvatarDemo(props: { values: { size: string; shape: string; content: string; color: string; broken: boolean; name: string } }) {
  return <div class="sc-row">
    {() => {
      const v = { ...props.values }
      const color = v.color === "name" ? undefined : v.color as "primary"
      const shared = { size: v.size as AvatarSize, shape: v.shape as "circle", color, text: v.content === "text" ? "?" : undefined, icon: v.content === "icon" ? user : undefined }
      return <>
        <Avatar name={v.name} src={v.broken ? PHOTO("missing") : PHOTO("sunset")} {...shared} />
        {USERS.slice(1, 5).map((u) => <Avatar name={u.name} {...shared} />)}
      </>
    }}
  </div>
}
