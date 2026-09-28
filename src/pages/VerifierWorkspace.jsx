import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function VerifierWorkspace() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [reworkNote, setReworkNote] = useState(null);
  const [form, setForm] = useState({
    contactPerson: "",
    contactDetail: "",
    relationship: "",
    confirmed: "",
    notes: "",
  });
  const [evidence, setEvidence] = useState({ label: "", note: "" });

  useEffect(() => {
    api.get(`/tasks/${taskId}`).then((res) => {
      setTask(res.data);
      if (res.data.findings) {
        setForm({
          contactPerson: res.data.findings.contactPerson || "",
          contactDetail: res.data.findings.contactDetail || "",
          relationship: res.data.findings.relationship || "",
          confirmed:
            res.data.findings.confirmed === true
              ? "yes"
              : res.data.findings.confirmed === false
                ? "no"
                : "",
          notes: res.data.findings.notes || "",
        });
      }
    });
    if (taskId) {
      api.get(`/reviews/task/${taskId}`).then((res) => {
        const lastRejection = res.data.find((r) => r.status === "rejected");
        if (lastRejection) setReworkNote(lastRejection);
      });
    }
  }, [taskId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function toggleChecklistItem(idx) {
    const res = await api.patch(`/tasks/${taskId}/checklist/${idx}`);
    setTask(res.data);
  }

  async function addEvidence() {
    if (!evidence.label) return;
    const res = await api.post(`/tasks/${taskId}/evidence`, evidence);
    setTask(res.data);
    setEvidence({ label: "", note: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api.patch(`/tasks/${taskId}/submit`, {
      ...form,
      confirmed: form.confirmed === "yes",
    });
    navigate(`/cases/${res.data.case}`);
  }

  if (!task)
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-stone-400 text-sm">Loading…</div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <h1 className="font-serif italic text-2xl mb-1">
        Verification Workspace
      </h1>
      <div className="mb-6">
        <p className="text-sm font-medium text-ink">
          {task.case?.candidate?.name} — {task.case?.client?.name}
        </p>
        <p className="text-stone-500 text-sm capitalize">
          {task.type} verification · {task.case?.caseNumber}
        </p>
      </div>

      {task.claim?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="text-xs font-medium text-amber-700 mb-2">
            What was claimed — check this against what you find
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {task.claim.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="text-stone-500">{c.label}: </span>
                <span className="text-stone-800 font-medium">
                  {c.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reworkNote && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
          <div className="text-xs font-medium text-rose-700 mb-1">
            <p className="text-black text-sm">
              Sent back for rework{" "}
              {reworkNote.reviewer?.name
                ? ` by ${reworkNote.reviewer.name}`
                : ""}
            </p>
          </div>
          <div className="text-sm text-rose-600">{reworkNote.comments}</div>
        </div>
      )}

      {task.checklist?.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <div className="text-xs text-stone-400 mb-2">Checklist</div>
          <div className="space-y-1.5">
            {task.checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklistItem(i)}
                  className="accent-gold"
                />
                <span
                  className={item.done ? "text-stone-700" : "text-stone-500"}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
        <div className="text-xs text-stone-400 mb-2">Evidence</div>
        {task.evidenceNotes?.map((e, i) => (
          <div key={i} className="text-sm mb-1">
            <strong>{e.label}:</strong> {e.note}
          </div>
        ))}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            placeholder="Label"
            value={evidence.label}
            onChange={(e) =>
              setEvidence({ ...evidence, label: e.target.value })
            }
            className="flex-1 min-w-0 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
          />
          <input
            placeholder="Note / reference"
            value={evidence.note}
            onChange={(e) => setEvidence({ ...evidence, note: e.target.value })}
            className="flex-1 min-w-0 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={addEvidence}
            className="text-xs bg-stone-100 px-3 py-1.5 rounded-lg hover:bg-stone-200"
          >
            Add
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500">
              Contact person
            </label>
            <input
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="e.g. Michael Ade"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500">
              Contact detail
            </label>
            <input
              value={form.contactDetail}
              onChange={(e) => update("contactDetail", e.target.value)}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Phone or email"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500">
            Relationship to candidate
          </label>
          <input
            value={form.relationship}
            onChange={(e) => update("relationship", e.target.value)}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="e.g. HR Manager"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500">
            Does what you found match the claim above?
          </label>
          <div className="flex gap-3 mt-1.5">
            {["yes", "no"].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => update("confirmed", opt)}
                className={`px-4 py-1.5 rounded-lg text-sm border capitalize ${
                  form.confirmed === opt
                    ? "bg-ink text-paper border-ink"
                    : "border-stone-300 text-stone-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="If it doesn't match, explain what's different…"
          />
        </div>

        <button
          type="submit"
          className="bg-ink text-paper rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-stone-800"
        >
          {task.reworkCount > 0 ? "Resubmit for Review" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
