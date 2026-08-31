import {
  AlertSticker,
  AllClearSticker,
  ApprovedSticker,
  BookSticker,
  ChatSticker,
  ContactSticker,
  GapSticker,
  HandoffSticker,
  InboxSticker,
  InstallSticker,
  KnowledgeSticker,
  LeadSticker,
  LiveSticker,
  MailSticker,
  PaymentSticker,
  PencilSticker,
  PendingSticker,
  PhoneSticker,
  ReceptionistSticker,
  RoutingSticker,
  ShieldSticker,
  SparkSticker,
  TagSticker,
  TargetSticker,
  WebhookSticker,
} from "@/components/stickers";
import type { DocSticker as DocStickerKey } from "@/lib/docs";

const MAP = {
  spark: SparkSticker,
  live: LiveSticker,
  knowledge: KnowledgeSticker,
  install: InstallSticker,
  routing: RoutingSticker,
  chat: ChatSticker,
  lead: LeadSticker,
  alert: AlertSticker,
  allClear: AllClearSticker,
  receptionist: ReceptionistSticker,
  book: BookSticker,
  pencil: PencilSticker,
  phone: PhoneSticker,
  contact: ContactSticker,
  payment: PaymentSticker,
  tag: TagSticker,
  mail: MailSticker,
  webhook: WebhookSticker,
  inbox: InboxSticker,
  shield: ShieldSticker,
  handoff: HandoffSticker,
  target: TargetSticker,
  approved: ApprovedSticker,
  pending: PendingSticker,
  gap: GapSticker,
} as const satisfies Record<DocStickerKey, unknown>;

export function DocSticker({
  name,
  size = 34,
  className,
}: {
  name: DocStickerKey;
  size?: number;
  className?: string;
}) {
  const S = MAP[name];
  return <S size={size} className={className} />;
}
