import { DASHBOARD_MENU, type DashboardRole } from "@/constants/dashboard-menu";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";

type DashboardResourceKey =
  | "users"
  | "moderators"
  | "admins"
  | "investorProfiles"
  | "investmentAccounts"
  | "savingsAccounts"
  | "investmentOrders";

export type DashboardResourceItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
};

export type DashboardResourceCollection = {
  key: DashboardResourceKey;
  href: string;
  label: string;
  total: number;
  items: DashboardResourceItem[];
};

const DASHBOARD_RESOURCE_ROUTE_MAP = {
  "/account/dashboard/admin/users": {
    key: "users",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  "/account/dashboard/admin/investors": {
    key: "investorProfiles",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  "/account/dashboard/admin/investment-accounts": {
    key: "investmentAccounts",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  "/account/dashboard/admin/savings-accounts": {
    key: "savingsAccounts",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  "/account/dashboard/admin/investment-orders": {
    key: "investmentOrders",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/admins": {
    key: "admins",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/moderators": {
    key: "moderators",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/users": {
    key: "users",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/investors": {
    key: "investorProfiles",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/investment-accounts": {
    key: "investmentAccounts",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/savings-accounts": {
    key: "savingsAccounts",
    roles: ["SUPER_ADMIN"],
  },
  "/account/dashboard/super-admin/investment-orders": {
    key: "investmentOrders",
    roles: ["SUPER_ADMIN"],
  },
} as const satisfies Record<
  string,
  { key: DashboardResourceKey; roles: DashboardRole[] }
>;

type DashboardResourceRouteHref = keyof typeof DASHBOARD_RESOURCE_ROUTE_MAP;

async function fetchResourceCollection<TItem>(input: {
  itemsPromise: Promise<TItem[]>;
  totalPromise: Promise<number>;
  mapItem: (item: TItem) => DashboardResourceItem;
}) {
  const [items, total] = await Promise.all([
    input.itemsPromise,
    input.totalPromise,
  ]);

  return {
    total,
    items: items.map(input.mapItem),
  };
}

async function fetchUsersByRole(role?: "USER" | "MODERATOR" | "ADMIN") {
  return fetchResourceCollection({
    itemsPromise: prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    totalPromise: prisma.user.count({
      where: role ? { role } : undefined,
    }),
    mapItem: (user) => ({
      id: user.id,
      title: user.name?.trim() || "Unnamed user",
      subtitle: user.email,
      meta: `${formatEnumLabel(user.role)} | Joined ${formatDateLabel(user.createdAt)}`,
    }),
  });
}

async function fetchInvestorProfiles() {
  return fetchResourceCollection({
    itemsPromise: prisma.investorProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        kycStatus: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    totalPromise: prisma.investorProfile.count(),
    mapItem: (profile) => ({
      id: profile.id,
      title: profile.user.name?.trim() || "Unnamed investor",
      subtitle: profile.user.email,
      meta: `${formatEnumLabel(profile.kycStatus)} | Created ${formatDateLabel(profile.createdAt)}`,
    }),
  });
}

async function fetchInvestmentAccounts() {
  return fetchResourceCollection({
    itemsPromise: prisma.investmentAccount.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        balance: true,
        currency: true,
        createdAt: true,
        investorProfile: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        investmentPlan: {
          select: {
            name: true,
          },
        },
      },
    }),
    totalPromise: prisma.investmentAccount.count(),
    mapItem: (account) => ({
      id: account.id,
      title: account.investorProfile.user.name?.trim() || "Unnamed investor",
      subtitle: `${account.investmentPlan.name} | ${account.investorProfile.user.email}`,
      meta: `${formatCurrency(decimalToNumber(account.balance), account.currency)} | ${formatEnumLabel(account.status)} | Opened ${formatDateLabel(account.createdAt)}`,
    }),
  });
}

async function fetchSavingsAccounts() {
  return fetchResourceCollection({
    itemsPromise: prisma.savingsAccount.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        balance: true,
        savingsProduct: {
          select: {
            name: true,
            currency: true,
          },
        },
        investorProfile: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    totalPromise: prisma.savingsAccount.count(),
    mapItem: (account) => ({
      id: account.id,
      title: account.investorProfile.user.name?.trim() || "Unnamed saver",
      subtitle: `${account.savingsProduct.name} | ${account.investorProfile.user.email}`,
      meta: `${formatCurrency(decimalToNumber(account.balance), account.savingsProduct.currency)} | ${formatEnumLabel(account.status)}`,
    }),
  });
}

async function fetchInvestmentOrders() {
  return fetchResourceCollection({
    itemsPromise: prisma.investmentOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        investorProfile: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        investmentPlan: {
          select: {
            name: true,
          },
        },
      },
    }),
    totalPromise: prisma.investmentOrder.count(),
    mapItem: (order) => ({
      id: order.id,
      title: order.investorProfile.user.name?.trim() || "Unnamed investor",
      subtitle: `${order.investmentPlan.name} | ${order.investorProfile.user.email}`,
      meta: `${formatCurrency(decimalToNumber(order.amount), order.currency)} | ${formatEnumLabel(order.status)} | ${formatDateLabel(order.createdAt)}`,
    }),
  });
}

async function fetchDashboardResourceCollection(
  key: DashboardResourceKey,
): Promise<Pick<DashboardResourceCollection, "key" | "total" | "items">> {
  switch (key) {
    case "users": {
      const data = await fetchUsersByRole("USER");
      return { key, ...data };
    }
    case "moderators": {
      const data = await fetchUsersByRole("MODERATOR");
      return { key, ...data };
    }
    case "admins": {
      const data = await fetchUsersByRole("ADMIN");
      return { key, ...data };
    }
    case "investorProfiles": {
      const data = await fetchInvestorProfiles();
      return { key, ...data };
    }
    case "investmentAccounts": {
      const data = await fetchInvestmentAccounts();
      return { key, ...data };
    }
    case "savingsAccounts": {
      const data = await fetchSavingsAccounts();
      return { key, ...data };
    }
    case "investmentOrders": {
      const data = await fetchInvestmentOrders();
      return { key, ...data };
    }
  }
}

function findRouteLabel(href: string, role: DashboardRole) {
  for (const section of DASHBOARD_MENU[role]) {
    const link = section.links.find((item) => item.href === href);
    if (link) return link.name;
  }

  return href;
}

export async function getDashboardResourceCollectionByHref(href: string) {
  if (!(href in DASHBOARD_RESOURCE_ROUTE_MAP)) {
    throw new Error(`No dashboard resource mapping found for ${href}.`);
  }

  const config =
    DASHBOARD_RESOURCE_ROUTE_MAP[href as DashboardResourceRouteHref];

  const access = await requireDashboardRoleAccess([...config.roles]);
  const data = await fetchDashboardResourceCollection(config.key);

  return {
    ...data,
    href,
    label: findRouteLabel(href, access.role),
  } satisfies DashboardResourceCollection;
}

export async function getDashboardCollectionsForRole(role: DashboardRole) {
  await requireDashboardRoleAccess([role]);

  const hrefs = Array.from(
    new Set(
      DASHBOARD_MENU[role]
        .flatMap((section) => section.links.map((link) => link.href))
        .filter(
          (href): href is DashboardResourceRouteHref =>
            href in DASHBOARD_RESOURCE_ROUTE_MAP,
        ),
    ),
  );

  return Promise.all(
    hrefs.map((href) => getDashboardResourceCollectionByHref(href)),
  );
}
