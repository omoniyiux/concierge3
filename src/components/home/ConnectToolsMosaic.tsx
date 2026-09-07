import {
  FacebookMark,
  GmailMark,
  GoogleCalendarMark,
  InstagramMark,
  LinkedInMark,
  WhatsAppBrandMark,
  WixMark,
  YouTubeMark,
} from "@/components/icons/brands";
import { SymphonyMark } from "@/components/icons/SymphonyMark";

/** The tools your agents work through, as app icons — Symphony at the centre. */
export function ConnectToolsMosaic() {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-[5px]" aria-hidden>
      <Tile bg="#ffffff">
        <GmailMark size={28} />
      </Tile>
      <Tile bg="transparent" bare>
        <InstagramMark size={41} />
      </Tile>
      <Tile bg="#ffffff">
        <GoogleCalendarMark size={37} />
      </Tile>

      <Tile bg="transparent" bare>
        <LinkedInMark size={41} />
      </Tile>
      <Tile bg="transparent" bare>
        <SymphonyMark size={41} />
      </Tile>
      <Tile bg="#ffffff">
        <WixMark size={34} />
      </Tile>

      <Tile bg="transparent" bare>
        <WhatsAppBrandMark size={41} />
      </Tile>
      <Tile bg="#ffffff">
        <YouTubeMark size={30} />
      </Tile>
      <Tile bg="transparent" bare>
        <FacebookMark size={41} />
      </Tile>
    </div>
  );
}

function Tile({
  bg,
  bare = false,
  children,
}: {
  bg: string;
  bare?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="flex h-[41px] w-[41px] items-center justify-center overflow-hidden rounded-[10px]"
      style={bare ? undefined : { background: bg, boxShadow: "0 1px 2px rgb(0 0 0 / 8%)" }}
    >
      {children}
    </span>
  );
}
