import Image from "next/image";
import { STATUS_STYLES, type LabSolution } from "@/lib/lab/schema";
import { labIcon } from "./icons";

/** Фото, загруженные через админку, уже ужаты в браузере — оптимизатор Next им не нужен */
export function isUploaded(photo: string): boolean {
  return photo.startsWith("/uploads/");
}

type CardData = Pick<LabSolution, "name" | "role" | "status" | "tone" | "icon" | "photo">;

/**
 * Карточка витрины. Одна и та же на /solutions, в тизере на главной и в
 * предпросмотре админки — в админке видно ровно то, что увидит посетитель.
 */
export default function SolutionCard({
  p,
  onClick,
}: {
  p: CardData;
  onClick?: () => void;
}) {
  const Icon = labIcon(p.icon);
  return (
    <button
      type="button"
      onClick={onClick}
      className="vm-card group flex h-full flex-col items-start text-left"
    >
      {p.photo ? (
        // Обложка выходит за padding карточки: -mx-8/-mt-8 компенсируют p-8
        <div className="relative -mx-8 -mt-8 self-stretch overflow-hidden rounded-t-3xl">
          <Image
            src={p.photo}
            alt={p.role}
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={isUploaded(p.photo)}
            className="aspect-[4/3] w-full object-cover"
          />
          <span
            className={`absolute right-3 top-3 rounded-2xl px-3 py-1 text-xs font-semibold shadow-sm ${STATUS_STYLES[p.tone]}`}
          >
            {p.status}
          </span>
        </div>
      ) : (
        <div className="flex w-full items-start justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <Icon className="h-6 w-6" />
          </span>
          <span
            className={`rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[p.tone]}`}
          >
            {p.status}
          </span>
        </div>
      )}
      <h3 className={`text-lg font-bold text-graphite ${p.photo ? "mt-6" : "mt-4"}`}>
        {p.name}
      </h3>
      <p className="mt-1 text-sm text-graphite/70">{p.role}</p>
      <span className="mt-4 text-sm font-semibold text-teal group-hover:underline">
        Подробнее →
      </span>
    </button>
  );
}
