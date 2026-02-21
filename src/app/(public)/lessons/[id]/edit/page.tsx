import { redirect } from "next/navigation";

interface EditLessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params;
  redirect(`/admin/lessons/${id}/edit`);
}
