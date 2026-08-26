import type { ComponentType } from "react";
import {
  BookSticker,
  CalendarSticker,
  ChatSticker,
  ContactSticker,
  InboxSticker,
  MailSticker,
  PaymentSticker,
  PencilSticker,
  PhoneSticker,
  QuoteSticker,
  ReceptionistSticker,
  RoutingSticker,
  SalesSticker,
  SupportSticker,
  TaskSticker,
  TagSticker,
  VideoSticker,
  WebhookSticker,
} from "@/components/stickers";
import type { ActionKind, AgentMode, DestinationKind } from "@/lib/types";

/* ============================================================================
   Which drawing stands for which thing. Kept in one place so an action gets
   the same sticker on the Agent's quick-action list, on the Actions grid and
   anywhere else it turns up.
   ========================================================================== */

type Sticker = ComponentType<{ size?: number; className?: string }>;

export const ACTION_STICKER: Record<ActionKind, Sticker> = {
  booking: CalendarSticker,
  consultation: CalendarSticker,
  quote: QuoteSticker,
  call: PhoneSticker,
  message: ChatSticker,
  "lead-capture": ContactSticker,
  payment: PaymentSticker,
  offer: TagSticker,
  video: VideoSticker,
};

export const MODE_STICKER: Record<AgentMode, Sticker> = {
  receptionist: ReceptionistSticker,
  "sales-assistant": SalesSticker,
  "customer-service": SupportSticker,
  "knowledge-assistant": BookSticker,
  custom: PencilSticker,
};

/** Where a routed request lands. Chat covers every room-shaped destination. */
export const DESTINATION_STICKER: Record<DestinationKind, Sticker> = {
  email: MailSticker,
  slack: ChatSticker,
  telegram: RoutingSticker,
  sms: PhoneSticker,
  webhook: WebhookSticker,
  taskologic: TaskSticker,
  ticket: QuoteSticker,
  inbox: InboxSticker,
};
