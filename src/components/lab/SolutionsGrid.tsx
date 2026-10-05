"use client";

import { useState } from "react";
import type { LabSolution } from "@/lib/lab/schema";
import SolutionCard from "./SolutionCard";
import SolutionModal from "./SolutionModal";

type CardCta = {
  label: string;
  href: string;
};

/** Сетка карточек с модалкой подробностей — на /solutions и в тизере главной */
export default function SolutionsGrid({
  items,
  cardCta,
}: {
  items: LabSolution[];
  cardCta?: CardCta;
}) {
  const [open, setOpen] = useState<LabSolution | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <SolutionCard
            key={p.id}
            p={p}
            onClick={() => setOpen(p)}
            cta={cardCta}
          />
        ))}
      </div>
      {open && <SolutionModal p={open} onClose={() => setOpen(null)} />}
    </>
  );
}
