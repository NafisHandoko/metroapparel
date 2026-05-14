"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { removeCartLineAction } from "@/app/actions/metro-cart";
import { Button } from "@/components/ui/button";

export function CartLineRemove({ lineId }: { lineId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onRemove() {
    setPending(true);
    await removeCartLineAction(lineId);
    setPending(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={onRemove}
      className="shrink-0 self-start border-white/20"
    >
      {pending ? "…" : "Hapus"}
    </Button>
  );
}
