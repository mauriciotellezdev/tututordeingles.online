import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") || "/teacher";
  if (pathname.startsWith("/teacher/login")) {
    return <>{children}</>;
  }
  const cookieStore = await cookies();
  if (cookieStore.get("teacher_session")?.value !== "true") {
    redirect("/teacher/login");
  }
  return <>{children}</>;
}
