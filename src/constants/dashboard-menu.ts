import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Wallet,
  ShieldCheck,
  FileText,
  Landmark,
  LineChart,
  Bell,
  Settings,
  BadgeCheck,
  Users,
  SearchCheck,
  ClipboardList,
  Activity,
  Briefcase,
  Building2,
  ScrollText,
  BarChart3,
  CircleDollarSign,
  UserCog,
  Layers,
  TrendingUp,
  Banknote,
  LifeBuoy,
} from "lucide-react";

export type DashboardRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export type DashboardNavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavSection = {
  title: string;
  links: DashboardNavLink[];
};

export const DASHBOARD_MENU = {
  USER: [
    {
      title: "Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard/user",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Portfolio",
      links: [
        {
          name: "Investment Profile",
          href: "/account/dashboard/user/investment-profile",
          icon: User,
        },
        {
          name: "Investment Accounts",
          href: "/account/dashboard/user/investment-accounts",
          icon: Wallet,
        },
        {
          name: "Manage Investment Orders",
          href: "/account/dashboard/user/investment-orders",
          icon: Landmark,
        },
        {
          name: "Performance",
          href: "/account/dashboard/user/performance",
          icon: LineChart,
        },
      ],
    },
    {
      title: "Payouts",
      links: [
        {
          name: "Withdrawals",
          href: "/account/dashboard/user/withdrawals",
          icon: Wallet,
        },

        {
          name: "Payment Info",
          href: "/account/dashboard/user/payment-info",
          icon: Landmark,
        },
        {
          name: "Transaction History",
          href: "/account/dashboard/user/transactions",
          icon: CircleDollarSign,
        },
      ],
    },
    {
      title: "Communication",
      links: [
        {
          name: "Support Center",
          href: "/account/dashboard/support",
          icon: LifeBuoy,
        },
      ],
    },
    {
      title: "Verification",
      links: [
        {
          name: "KYC Verification",
          href: "/account/dashboard/user/kyc",
          icon: BadgeCheck,
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          name: "Profile",
          href: "/account/dashboard/profile",
          icon: User,
        },
        {
          name: "Settings",
          href: "/account/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],

  MODERATOR: [
    {
      title: "Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard/moderator",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Review Queue",
      links: [
        {
          name: "KYC Reviews",
          href: "/account/dashboard/moderator/kyc-documents",
          icon: SearchCheck,
        },
        {
          name: "Investment Orders",
          href: "/account/dashboard/moderator/investment-orders",
          icon: ClipboardList,
        },
        {
          name: "Testimonials",
          href: "/account/dashboard/moderator/testimonies",
          icon: FileText,
        },
      ],
    },
    {
      title: "Monitoring",
      links: [
        {
          name: "Audit Logs",
          href: "/account/dashboard/moderator/audit-logs",
          icon: ScrollText,
        },
        {
          name: "Activity Feed",
          href: "/account/dashboard/moderator/activity",
          icon: Activity,
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          name: "Profile",
          href: "/account/dashboard/moderator/profile",
          icon: User,
        },
        {
          name: "Settings",
          href: "/account/dashboard/moderator/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Communication",
      links: [
        {
          name: "Support Center",
          href: "/account/dashboard/support",
          icon: LifeBuoy,
        },
      ],
    },
  ],

  ADMIN: [
    {
      title: "Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard/admin",
          icon: LayoutDashboard,
        },
        {
          name: "Analytics",
          href: "/account/dashboard/admin/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Operations",
      links: [
        {
          name: "Users",
          href: "/account/dashboard/admin/users",
          icon: Users,
        },
        {
          name: "Investor Profiles",
          href: "/account/dashboard/admin/investors",
          icon: Briefcase,
        },
        {
          name: "Investment Accounts",
          href: "/account/dashboard/admin/investment-accounts",
          icon: CircleDollarSign,
        },
        {
          name: "Investment Orders",
          href: "/account/dashboard/admin/investment-orders",
          icon: ClipboardList,
        },
        {
          name: "KYC Management",
          href: "/account/dashboard/admin/kyc-documents",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Financial",
      links: [
        {
          name: "Funding Intents",
          href: "/account/dashboard/admin/funding-intents",
          icon: Wallet,
        },
        {
          name: "Platform Wallets",
          href: "/account/dashboard/admin/platform-wallets",
          icon: Landmark,
        },
        {
          name: "Transactions",
          href: "/account/dashboard/admin/transactions",
          icon: CircleDollarSign,
        },
      ],
    },
    {
      title: "Investment Catalog",
      links: [
        {
          name: "Investments",
          href: "/account/dashboard/admin/investments",
          icon: TrendingUp,
        },
        {
          name: "Investment Plans",
          href: "/account/dashboard/admin/investment-plans",
          icon: Layers,
        },
      ],
    },
    {
      title: "Content & Compliance",
      links: [
        {
          name: "Testimonials",
          href: "/account/dashboard/admin/testimonies",
          icon: FileText,
        },
        {
          name: "Audit Logs",
          href: "/account/dashboard/admin/audit-logs",
          icon: ScrollText,
        },
      ],
    },
    {
      title: "Communication",
      links: [
        {
          name: "Support Center",
          href: "/account/dashboard/support",
          icon: LifeBuoy,
        },
      ],
    },
    {
      title: "System",
      links: [
        {
          name: "Profile",
          href: "/account/dashboard/profile",
          icon: User,
        },
        {
          name: "Settings",
          href: "/account/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],

  SUPER_ADMIN: [
    {
      title: "Executive Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard/super-admin",
          icon: LayoutDashboard,
        },
        {
          name: "Platform Analytics",
          href: "/account/dashboard/super-admin/analytics",
          icon: BarChart3,
        },
        {
          name: "System Health",
          href: "/account/dashboard/super-admin/system-health",
          icon: Activity,
        },
      ],
    },
    {
      title: "Administration",
      links: [
        {
          name: "Admins",
          href: "/account/dashboard/super-admin/admins",
          icon: UserCog,
        },
        {
          name: "Moderators",
          href: "/account/dashboard/super-admin/moderators",
          icon: ShieldCheck,
        },
        {
          name: "Users",
          href: "/account/dashboard/super-admin/users",
          icon: Users,
        },
      ],
    },
    {
      title: "Platform Control",
      links: [
        {
          name: "Investor Profiles",
          href: "/account/dashboard/super-admin/investors",
          icon: Briefcase,
        },
        {
          name: "Investment Accounts",
          href: "/account/dashboard/super-admin/investment-accounts",
          icon: Wallet,
        },
        {
          name: "Investment Orders",
          href: "/account/dashboard/super-admin/investment-orders",
          icon: ClipboardList,
        },
        {
          name: "Funding Intents",
          href: "/account/dashboard/super-admin/funding-intents",
          icon: Landmark,
        },
        {
          name: "Platform Wallets",
          href: "/account/dashboard/super-admin/platform-wallets",
          icon: Banknote,
        },
        {
          name: "Management Team",
          href: "/account/dashboard/super-admin/management",
          icon: Building2,
        },
      ],
    },
    {
      title: "Investment Catalog",
      links: [
        {
          name: "Investments",
          href: "/account/dashboard/super-admin/investments",
          icon: TrendingUp,
        },
        {
          name: "Investment Plans",
          href: "/account/dashboard/super-admin/investment-plans",
          icon: Layers,
        },
      ],
    },
    {
      title: "Compliance & Logs",
      links: [
        {
          name: "Audit Logs",
          href: "/account/dashboard/super-admin/audit-logs",
          icon: ScrollText,
        },
        {
          name: "KYC Documents",
          href: "/account/dashboard/super-admin/kyc-documents",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Communication",
      links: [
        {
          name: "Support Center",
          href: "/account/dashboard/support",
          icon: LifeBuoy,
        },
      ],
    },
    {
      title: "System",
      links: [
        {
          name: "Settings",
          href: "/account/dashboard/super-admin/settings",
          icon: Settings,
        },
        {
          name: "Profile",
          href: "/account/dashboard/super-admin/profile",
          icon: User,
        },
      ],
    },
  ],
} as const satisfies Record<DashboardRole, DashboardNavSection[]>;

export const getDashboardMenu = (role: DashboardRole): DashboardNavSection[] =>
  DASHBOARD_MENU[role] as DashboardNavSection[];
