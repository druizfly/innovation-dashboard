"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteLesson } from "@/app/lessons/actions";

interface DeleteLessonButtonProps {
  lessonId: number;
  lessonTitle: string;
}

export function DeleteLessonButton({
  lessonId,
  lessonTitle,
}: DeleteLessonButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await deleteLesson(lessonId);
    setPending(false);

    if (result.success) {
      setOpen(false);
      router.push("/lessons");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lesson</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{lessonTitle}&quot;? This
            action can be undone by an administrator.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
