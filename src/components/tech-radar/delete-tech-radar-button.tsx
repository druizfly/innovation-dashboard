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
import { deleteTechRadarItem } from "@/app/tech-radar/actions";

interface DeleteTechRadarButtonProps {
  itemId: number;
  itemName: string;
}

export function DeleteTechRadarButton({
  itemId,
  itemName,
}: DeleteTechRadarButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await deleteTechRadarItem(itemId);
    setPending(false);

    if (result.success) {
      setOpen(false);
      router.push("/tech-radar");
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
          <DialogTitle>Delete Technology</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove &quot;{itemName}&quot; from the tech
            radar? This action can be undone by an administrator.
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
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete Technology"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
