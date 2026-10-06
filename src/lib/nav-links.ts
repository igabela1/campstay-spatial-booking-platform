import {
  LayoutDashboard,
  Users,
  Building,
  PlusCircle,
  MessageSquareQuote,
  User,
  Settings,
  LifeBuoy,
  Map,
  CalendarCheck,
  Heart,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  iconName: keyof typeof iconMap;
  children?: NavLink[];
};

export const iconMap = {
  LayoutDashboard,
  Users,
  Building,
  PlusCircle,
  MessageSquareQuote,
  User,
  Settings,
  LifeBuoy,
  Map,
  CalendarCheck,
  Heart,
};

export const guestNavLinks: NavLink[] = [
  {
    href: "/my-reservations",
    label: "My Reservations",
    iconName: "CalendarCheck",
  },
  {
    href: "/my-favorites",
    label: "Favorites",
    iconName: "Heart",
  },
];

export const providerNavLinks: NavLink[] = [
  {
    href: "/provider/dashboard",
    label: "Dashboard",
    iconName: "LayoutDashboard",
  },
  {
    href: "/provider/listings/new",
    label: "Add Accommodation",
    iconName: "PlusCircle",
  },
  {
    href: "/provider/profile",
    label: "Profile",
    iconName: "User",
  },
  {
    href: "/provider/settings",
    label: "Settings",
    iconName: "Settings",
  },
];

export const adminNavLinks: NavLink[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    iconName: "LayoutDashboard",
  },
  {
    href: "/admin/users",
    label: "Users",
    iconName: "Users",
  },
  {
    href: "/admin/listings",
    label: "Accommodations",
    iconName: "Building",
  },
  {
    href: "/admin/reservations",
    label: "Reservations",
    iconName: "CalendarCheck",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    iconName: "Settings",
  },
];