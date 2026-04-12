import { getPublicManagementTeam } from "@/lib/service/getPublicManagementTeam";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { ManagementTeamSectionClient } from "./Management-team-section.client";

export async function ManagementTeamSection() {
  const [members, siteConfig] = await Promise.all([
    getPublicManagementTeam(),
    getSiteConfigurationCached(),
  ]);

  const team = members.map((member, index) => ({
    id: member.id,
    name: member.name,
    role: member.title?.trim() || member.role?.trim() || "Leadership Team",
    description:
      member.bio?.trim() ||
      "Provides leadership, operational clarity, and long-term stewardship across the company.",
    photoUrl: member.photoFile?.url ?? null,
    featured: index === 0,
  }));

  if (team.length === 0) {
    return null;
  }

  return (
    <ManagementTeamSectionClient
      team={team}
      brandName={siteConfig?.siteName?.trim() || "Creston Capital"}
      brandTagline={
        "Structured financial systems, operational clarity, and long-term trust."
      }
      brandDescription={
        siteConfig?.siteDescription?.trim() ||
        "A leadership team focused on building dependable financial experiences."
      }
    />
  );
}
