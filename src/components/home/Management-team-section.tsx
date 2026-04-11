import { getPublicManagementTeam } from "@/lib/service/getPublicManagementTeam";
import { ManagementTeamSectionClient } from "./Management-team-section.client";

export async function ManagementTeamSection() {
  const members = await getPublicManagementTeam();

  const team = members.map((member, index) => ({
    id: member.id,
    name: member.name,
    role: member.title?.trim() || member.role?.trim() || "Leadership Team",
    description:
      member.bio?.trim() ||
      "Provides leadership, operational clarity, and long-term stewardship across Havenstone.",
    photoUrl: member.photoFile?.url ?? null,
    featured: index === 0,
  }));

  if (team.length === 0) {
    return null;
  }

  return <ManagementTeamSectionClient team={team} />;
}
