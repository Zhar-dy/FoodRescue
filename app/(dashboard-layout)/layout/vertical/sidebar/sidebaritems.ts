export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean
}

import { uniqueId } from "lodash";

import {
  House,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

const SidebarContent: MenuItem[] = [
  {
    heading: "Overview",
    items: [
      {
        id: uniqueId(),
        name: "Dashboard",
        icon: House,
        url: "/",
      },
      {
        id: uniqueId(),
        name: "AI Predictions",
        icon: TrendingUp,
        url: "/merchant/predictions",
      },
    ],
  },
];

export default SidebarContent;
