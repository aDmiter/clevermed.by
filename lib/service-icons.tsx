import {
  Activity,
  Brain,
  FlaskConical,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIconKey } from "@/lib/services-catalog";

export const SERVICE_ICONS: Record<ServiceIconKey, LucideIcon> = {
  brain: Brain,
  heart: HeartPulse,
  activity: Activity,
  lab: FlaskConical,
};
