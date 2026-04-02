import { redirect } from "next/navigation";

export default function UserInvestmentsPage() {
  redirect("/account/dashboard/user/investments/new");
}
