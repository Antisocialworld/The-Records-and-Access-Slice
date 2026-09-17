import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SecuritySettings } from "./security-settings";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/signin");
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      everydayCodeHash: true,
      everydayCodeUpdatedAt: true,
    },
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: "1rem" }}>
      <SecuritySettings
        email={fullUser!.email}
        hasEverydayCode={!!fullUser!.everydayCodeHash}
        everydayCodeUpdatedAt={fullUser!.everydayCodeUpdatedAt?.toISOString() ?? null}
      />
    </div>
  );
}
