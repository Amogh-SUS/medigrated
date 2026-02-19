// client/src/pages/patient-view/family-monitoring.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const blank = { name: "", relation: "", age: "", notes: "" };

export default function FamilyMonitoring() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/family", { withCredentials: true });
      if (res?.data?.success) setMembers(res.data.members || []);
      else setError(res?.data?.message || "Failed to load members");
    } catch (err) {
      console.error("fetchMembers error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.relation) {
      setError("Please provide name and relation.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/family", form, { withCredentials: true });
      if (res?.data?.success) {
        setForm(blank);
        fetchMembers();
      } else {
        setError(res?.data?.message || "Failed to add");
      }
    } catch (err) {
      console.error("add member error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this family member?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/family/${id}`, { withCredentials: true });
      if (res?.data?.success) fetchMembers();
      else setError(res?.data?.message || "Delete failed");
    } catch (err) {
      console.error("delete error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Family Monitoring</h2>
        <div className="text-sm text-muted-foreground">Add and monitor family members' health</div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border rounded-md bg-transparent"
        />
        <input
          placeholder="Relation (eg. Mom)"
          value={form.relation}
          onChange={(e) => setForm({ ...form, relation: e.target.value })}
          className="px-3 py-2 border rounded-md bg-transparent"
        />
        <input
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className="px-3 py-2 border rounded-md bg-transparent"
        />
        <div className="flex items-center gap-2">
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="px-3 py-2 border rounded-md bg-transparent flex-1"
          />
          <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add"}</Button>
        </div>
      </form>

      {error && <div className="mb-3 text-sm text-destructive">{error}</div>}

      <div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading family members...</div>
        ) : members.length === 0 ? (
          <div className="text-sm text-muted-foreground">No family members added yet.</div>
        ) : (
          <div className="grid gap-3">
            {members.map((m) => (
              <div key={m._id} className="p-3 border rounded-md bg-card flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-lg">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{m.relation} • Age: {m.age || "—"}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{m.notes}</div>

                  {/* placeholder: latest status / vitals — replace later with real data */}
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Latest status:</span>{" "}
                    <span className="text-muted-foreground">{m.latestStatus || "No recent data"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="ghost" onClick={() => alert("Open profile / history (implement later)")}>View</Button>
                  <Button variant="destructive" onClick={() => handleDelete(m._id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
