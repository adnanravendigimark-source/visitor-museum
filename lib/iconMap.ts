import type { ComponentType } from "react";
import {
  ShieldCheckIcon,
  ClockPayIcon,
  RefundIcon,
  LockIcon,
  TicketIcon,
  HeadsetIcon,
  StarIcon,
  MailIcon,
  BriefcaseIcon,
  ColosseumIcon,
  GladiatorSwordIcon,
} from "@/components/icons";

export const ICON_OPTIONS: Record<string, ComponentType<{ className?: string }>> = {
  ShieldCheckIcon,
  ClockPayIcon,
  RefundIcon,
  LockIcon,
  TicketIcon,
  HeadsetIcon,
  StarIcon,
  MailIcon,
  BriefcaseIcon,
  ColosseumIcon,
  GladiatorSwordIcon,
};

export function getIconComponent(key: string) {
  return ICON_OPTIONS[key] || ShieldCheckIcon;
}
