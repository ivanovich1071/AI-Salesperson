import Image from "next/image";
import { STATUS_STYLES, type LabSolution } from "@/lib/lab/schema";
import { labIcon } from "./icons";
import { isUploaded } from "./SolutionCard";

/** Подробности решения. «Запросить демо» ведет к блоку #contacts той же страницы. */
export default function SolutionModal({
  p,
  onClose,
}: {
  p: LabSolution;
  onClose: () => void;
}) {
  const Icon = labIcon(p.icon);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/80 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-auto rounded-3xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {p.photo && (
          <div className="-mx-8 -mt-8 mb-6 overflow-hidden rounded-t-3xl">
            <Image
              src={p.photo}
              alt={p.role}
              width={800}
              height={450}
              sizes="(max-width: 640px) 100vw, 512px"
              unoptimized={isUploaded(p.photo)}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {!p.photo && (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                <Icon className="h-6 w-6" />
              </span>
            )}
            <div>
              <h3 className="text-xl font-bold text-graphite">{p.name}</h3>
              <p className="text-sm text-graphite/70">{p.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="text-2xl leading-none text-graphite/50 hover:text-graphite"
          >
            ×
          </button>
        </div>

        <span
          className={`mt-4 inline-block rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[p.tone]}`}
        >
          {p.status}
        </span>

        <p className="mt-4 text-graphite/80">{p.task}</p>

        {p.abilities.length > 0 && (
          <>
            <h4 className="mt-5 font-bold text-graphite">Что умеет</h4>
            <ul className="mt-2 space-y-2">
              {p.abilities.map((a) => (
                <li key={a} className="flex gap-2 text-sm text-graphite/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {a}
                </li>
              ))}
            </ul>
          </>
        )}

        {p.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-2xl bg-mist px-3 py-1 text-xs font-medium text-graphite/70"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {p.note && <p className="mt-4 text-xs text-graphite/60">{p.note}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {p.liveUrl && (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal !px-6 !py-3 !text-sm"
            >
              {p.liveLabel || "Открыть"}
            </a>
          )}
          <a
            href="#contacts"
            onClick={onClose}
            className="btn-teal-outline !px-6 !py-3 !text-sm"
          >
            Запросить демо
          </a>
        </div>
      </div>
    </div>
  );
}
