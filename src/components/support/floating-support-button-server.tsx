import { getCurrentUser } from "@/lib/getCurrentUser";
import { FloatingSupportButton } from "./floating-support-button";

export async function FloatingSupportButtonServer() {
  const user = await getCurrentUser();

  return <FloatingSupportButton role={user?.role ?? null} />;
}
