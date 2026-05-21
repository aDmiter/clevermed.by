"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DurationDto, ProcedureDto } from "@/lib/appointments/serializer";

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}));
  throw new Error(
    typeof data.error === "string" ? data.error : "Произошла ошибка",
  );
}

const fieldClass =
  "w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-primary-dark outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/20";

export function SiteSettingsAdmin() {
  const [durations, setDurations] = useState<DurationDto[]>([]);
  const [procedures, setProcedures] = useState<ProcedureDto[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [newDuration, setNewDuration] = useState({ label: "", minutes: 25 });
  const [newProcedure, setNewProcedure] = useState({
    title: "",
    durationId: "",
    doctorIds: [] as string[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, pRes, docRes] = await Promise.all([
        fetch("/api/admin/settings/durations"),
        fetch("/api/admin/settings/procedures"),
        fetch("/api/admin/doctors"),
      ]);
      if (!dRes.ok) await parseError(dRes);
      if (!pRes.ok) await parseError(pRes);
      if (!docRes.ok) await parseError(docRes);
      const dData = await dRes.json();
      const pData = await pRes.json();
      const docData = await docRes.json();
      setDurations(dData.durations);
      setProcedures(pData.procedures);
      setDoctors(
        docData.doctors.map((d: { id: string; name: string }) => ({
          id: d.id,
          name: d.name,
        })),
      );
      if (!newProcedure.durationId && dData.durations[0]) {
        setNewProcedure((p) => ({
          ...p,
          durationId: dData.durations[0].id,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [newProcedure.durationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addDuration() {
    const res = await fetch("/api/admin/settings/durations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDuration),
    });
    if (!res.ok) await parseError(res);
    setNewDuration({ label: "", minutes: 25 });
    setMessage("Длительность добавлена");
    await load();
  }

  async function deleteDuration(id: string) {
    if (!confirm("Удалить длительность?")) return;
    const res = await fetch(`/api/admin/settings/durations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setMessage("Удалено");
    await load();
  }

  async function addProcedure() {
    const res = await fetch("/api/admin/settings/procedures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProcedure),
    });
    if (!res.ok) await parseError(res);
    setNewProcedure({
      title: "",
      durationId: durations[0]?.id ?? "",
      doctorIds: [],
    });
    setMessage("Процедура добавлена");
    await load();
  }

  async function deleteProcedure(id: string) {
    if (!confirm("Удалить процедуру?")) return;
    const res = await fetch(`/api/admin/settings/procedures/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) await parseError(res);
    setMessage("Удалено");
    await load();
  }

  function toggleDoctorForProcedure(doctorId: string) {
    setNewProcedure((p) => ({
      ...p,
      doctorIds: p.doctorIds.includes(doctorId)
        ? p.doctorIds.filter((id) => id !== doctorId)
        : [...p.doctorIds, doctorId],
    }));
  }

  if (loading) {
    return <p className="text-primary-dark/60">Загрузка…</p>;
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Настройки сайта</h1>
        <p className="mt-1 text-sm text-primary-dark/60">
          Длительности приёма и процедуры для онлайн-записи
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-secondary-mint px-3 py-2 text-sm text-primary-green">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary-dark">
          Длительности приёма
        </h2>
        <ul className="mb-6 space-y-2">
          {durations.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-neutral-border px-4 py-3"
            >
              <span>
                <strong>{d.label}</strong> — {d.minutes} мин.
              </span>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => void deleteDuration(d.id)}
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <input
            className={`${fieldClass} max-w-[200px]`}
            placeholder="Название"
            value={newDuration.label}
            onChange={(e) =>
              setNewDuration((d) => ({ ...d, label: e.target.value }))
            }
          />
          <input
            type="number"
            className={`${fieldClass} w-24`}
            min={5}
            step={5}
            value={newDuration.minutes}
            onChange={(e) =>
              setNewDuration((d) => ({
                ...d,
                minutes: Number(e.target.value),
              }))
            }
          />
          <Button type="button" onClick={() => void addDuration()}>
            <Plus size={16} data-icon="inline-start" />
            Добавить
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-border bg-white/70 p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary-dark">
          Процедуры
        </h2>
        <ul className="mb-6 space-y-2">
          {procedures.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-neutral-border px-4 py-3 text-sm"
            >
              <p className="font-semibold text-primary-dark">{p.title}</p>
              <p className="text-primary-dark/60">
                {p.durationLabel} · врачей: {p.doctorIds.length}
              </p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <input
            className={fieldClass}
            placeholder="Название процедуры"
            value={newProcedure.title}
            onChange={(e) =>
              setNewProcedure((p) => ({ ...p, title: e.target.value }))
            }
          />
          <select
            className={fieldClass}
            value={newProcedure.durationId}
            onChange={(e) =>
              setNewProcedure((p) => ({ ...p, durationId: e.target.value }))
            }
          >
            {durations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.minutes} мин.)
              </option>
            ))}
          </select>
          <div>
            <p className="mb-2 text-sm font-medium text-primary-dark">Врачи</p>
            <div className="flex flex-wrap gap-2">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDoctorForProcedure(doc.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    newProcedure.doctorIds.includes(doc.id)
                      ? "bg-primary-green text-white"
                      : "bg-neutral-bg text-primary-dark/70 hover:bg-secondary-mint"
                  }`}
                >
                  {doc.name}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" onClick={() => void addProcedure()}>
            <Plus size={16} data-icon="inline-start" />
            Добавить процедуру
          </Button>
        </div>
      </section>
    </div>
  );
}
