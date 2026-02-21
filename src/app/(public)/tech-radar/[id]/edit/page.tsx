import { redirect } from "next/navigation";

interface EditTechRadarPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTechRadarPage({ params }: EditTechRadarPageProps) {
  const { id } = await params;
  redirect(`/admin/tech-radar/${id}/edit`);
}
