import type { ContactContent, OpeningHours } from "@/lib/types";
import { Cta } from "./shared";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const clock = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
};

/**
 * Hours are read off the site rather than retyped into the section. An owner
 * who changes their Saturday in settings should not discover months later that
 * the website still advertises the old one.
 */
function Hours({ hours }: { hours: OpeningHours }) {
  return (
    <div className="ps-contact__row">
      <span className="ps-contact__label">Opening hours</span>
      <ul className="ps-stack" style={{ listStyle: "none", margin: "6px 0 0", padding: 0, gap: 4 }}>
        {hours.days.map((day, i) => (
          <li key={DAYS[i]} style={{ fontSize: 14.5 }}>
            {DAYS[i]}
            {": "}
            {day ? `${clock(day.opens)} – ${clock(day.closes)}` : "Closed"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Contact({ content, hours }: { content: ContactContent; hours?: OpeningHours }) {
  const rows: { label: string; value: string }[] = [];
  if (content.phone) rows.push({ label: "Phone", value: content.phone });
  if (content.email) rows.push({ label: "Email", value: content.email });
  if (content.address) rows.push({ label: "Address", value: content.address });

  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.body && <p className="ps-intro">{content.body}</p>}
      <ul className="ps-contact__list">
        {rows.map((row) => (
          <li key={row.label} className="ps-contact__row">
            <span className="ps-contact__label">{row.label}</span>
            <span className="ps-contact__value">{row.value}</span>
          </li>
        ))}
        {content.showHours && hours && (
          <li>
            <Hours hours={hours} />
          </li>
        )}
      </ul>
      {content.actionId && (
        <div className="ps-actions">
          <Cta cta={{ label: "Send an enquiry", actionId: content.actionId }} />
        </div>
      )}
    </>
  );
}
