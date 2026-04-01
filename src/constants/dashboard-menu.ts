import {
  LayoutDashboard,
  BarChart2,
  Wallet,
  User,
  BadgeCheck,
  FolderOpen,
  HistoryIcon,
  FileChartColumn,
  Clock,
  Mail,
  HelpCircle,
  Settings,
  Activity,
  Users,
  Receipt,
  ShieldCheck,
  Scale,
  Award,
  Briefcase,
  HardDrive,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Landmark,
  FileText,
  CreditCard,
} from "lucide-react";

export type DashboardRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export type DashboardNavLink = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type DashboardNavSection = {
  title: string;
  links: DashboardNavLink[];
};

export type DashboardNavConfig = Record<DashboardRole, DashboardNavSection[]>;

export const dashboardNavConfig: DashboardNavConfig = {
  USER: [
    {
      title: "Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Portfolio",
          href: "/account/dashboard/user/portfolio",
          icon: BarChart2,
        },
        {
          name: "Investment Accounts",
          href: "/account/dashboard/user/accounts",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Identity & Verification",
      links: [
        {
          name: "Profile",
          href: "/account/dashboard/user/profile",
          icon: User,
        },
        {
          name: "KYC Verification",
          href: "/account/dashboard/user/kyc",
          icon: BadgeCheck,
        },
        {
          name: "Documents",
          href: "/account/dashboard/user/documents",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "Activity",
      links: [
        {
          name: "Transaction History",
          href: "/account/dashboard/user/history",
          icon: HistoryIcon,
        },
        {
          name: "Statements & Reports",
          href: "/account/dashboard/user/reports",
          icon: FileChartColumn,
        },
        {
          name: "Account Status",
          href: "/account/dashboard/user/status",
          icon: Clock,
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          name: "Messages",
          href: "/messages",
          icon: Mail,
        },
        {
          name: "Help & Support",
          href: "/support",
          icon: HelpCircle,
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ],

  MODERATOR: [
    {
      title: "Moderation",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "KYC Queue",
          href: "/account/dashboard/moderator/kyc",
          icon: BadgeCheck,
        },
        {
          name: "Document Reviews",
          href: "/account/dashboard/moderator/documents",
          icon: FileText,
        },
        {
          name: "Incidents",
          href: "/account/dashboard/moderator/incidents",
          icon: ShieldAlert,
        },
        {
          name: "Flags & Alerts",
          href: "/account/dashboard/moderator/alerts",
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: "Client Oversight",
      links: [
        {
          name: "Investors",
          href: "/account/dashboard/moderator/investors",
          icon: Users,
        },
        {
          name: "Accounts",
          href: "/account/dashboard/moderator/accounts",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          name: "Messages",
          href: "/messages",
          icon: Mail,
        },
        {
          name: "Support Tickets",
          href: "/support",
          icon: HelpCircle,
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          name: "Profile",
          href: "/profile",
          icon: User,
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ],

  ADMIN: [
    {
      title: "Platform Overview",
      links: [
        {
          name: "Dashboard",
          href: "/account/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Analytics",
          href: "/account/dashboard/admin/analytics",
          icon: BarChart2,
        },
        {
          name: "Operations",
          href: "/account/dashboard/admin/operations",
          icon: Activity,
        },
        {
          name: "Reports",
          href: "/account/dashboard/admin/reports",
          icon: FileChartColumn,
        },
      ],
    },
    {
      title: "Client Management",
      links: [
        {
          name: "Investors",
          href: "/account/dashboard/admin/investors",
          icon: Users,
        },
        {
          name: "Investment Accounts",
          href: "/account/dashboard/admin/investment-accounts",
          icon: Wallet,
        },
        {
          name: "KYC Reviews",
          href: "/account/dashboard/admin/kyc",
          icon: BadgeCheck,
        },
        {
          name: "Documents",
          href: "/account/dashboard/admin/documents",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "Operations & Compliance",
      links: [
        {
          name: "Transactions",
          href: "/account/dashboard/admin/transactions",
          icon: Receipt,
        },
        {
          name: "Compliance",
          href: "/account/dashboard/admin/compliance",
          icon: ShieldCheck,
        },
        {
          name: "Audit Logs",
          href: "/account/dashboard/admin/audit-logs",
          icon: Scale,
        },
        {
          name: "Testimonials",
          href: "/account/dashboard/admin/testimonies",
          icon: Award,
        },
      ],
    },
    {
      title: "Internal Management",
      links: [
        {
          name: "Staff",
          href: "/account/dashboard/admin/staff",
          icon: Briefcase,
        },
        {
          name: "File Assets",
          href: "/account/dashboard/admin/files",
          icon: HardDrive,
        },
        {
          name: "Site Settings",
          href: "/account/dashboard/admin/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          name: "Messages",
          href: "/messages",
          icon: Mail,
        },
        {
          name: "Support Desk",
          href: "/account/dashboard/admin/support",
          icon: HelpCircle,
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
          href: "/account/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Executive Analytics",
          href: "/account/dashboard/super-admin/analytics",
          icon: Landmark,
        },
        {
          name: "Risk & Compliance",
          href: "/account/dashboard/super-admin/compliance",
          icon: ShieldCheck,
        },
        {
          name: "Audit Center",
          href: "/account/dashboard/super-admin/audit-logs",
          icon: Scale,
        },
      ],
    },
    {
      title: "Administration",
      links: [
        {
          name: "Admins",
          href: "/account/dashboard/super-admin/admins",
          icon: Users,
        },
        {
          name: "Moderators",
          href: "/account/dashboard/super-admin/moderators",
          icon: ShieldAlert,
        },
        {
          name: "Staff",
          href: "/account/dashboard/super-admin/staff",
          icon: Briefcase,
        },
        {
          name: "Investors",
          href: "/account/dashboard/super-admin/investors",
          icon: User,
        },
      ],
    },
    {
      title: "System",
      links: [
        {
          name: "File Assets",
          href: "/account/dashboard/super-admin/files",
          icon: HardDrive,
        },
        {
          name: "Testimonials",
          href: "/account/dashboard/super-admin/testimonies",
          icon: Award,
        },
        {
          name: "Platform Settings",
          href: "/account/dashboard/super-admin/settings",
          icon: Settings,
        },
        {
          name: "Organization",
          href: "/account/dashboard/super-admin/organization",
          icon: Building2,
        },
      ],
    },
  ],
} as const;

export function getDashboardNavByRole(role: DashboardRole) {
  return dashboardNavConfig[role] ?? dashboardNavConfig.USER;
}

export function getAllDashboardLinksByRole(role: DashboardRole) {
  return getDashboardNavByRole(role).flatMap((section) => section.links);
}
