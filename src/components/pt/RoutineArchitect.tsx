"use client";

import React, { useState } from "react";
import { Plus, ArrowUp, ArrowDown, Trash2, Save, Sparkles, CheckCircle2, Dumbbell, Layers, RefreshCw } from "lucide-react";

export interface ArchitectExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
}

export interface RoutineArchitectProps {
  initialTitle?: string;
  initialTargetGroup?: string;
  initialExercises?: ArchitectExercise[];
  onSave?: (routine: { title: string; targetGroup: string; exercises: ArchitectExercise[] }) => void;
}

const DEFAULT_ROUTINES = [
  {
    id: "r-1",
    title: "Hypertrophy Push Alpha",
    targetGroup: "Chest, Shoulders & Triceps",
    exercises: [
      { id: "ex-101", name: "Barbell Bench Press", targetSets: 3, targetReps: "x10" },
      { id: "ex-102", name: "Incline Dumbbell Chest Press", targetSets: 3, targetReps: "x8-12" },
      { id: "ex-103", name: "Overhead Barbell Press", targetSets: 3, targetReps: "x10" },
      { id: "ex-104", name: "Weighted Chest Dips", targetSets: 3, targetReps: "x Max reps" },
      { id: "ex-105", name: "Skull Crushers (EZ Bar)", targetSets: 3, targetReps: "x12" },
    ],
  },
  {
    id: "r-2",
    title: "Pull & Back Power",
    targetGroup: "Back & Biceps",
    exercises: [
      { id: "ex-201", name: "Deadlift (Heavy)", targetSets: 4, targetReps: "x5" },
      { id: "ex-202", name: "Weighted Pullups", targetSets: 3, targetReps: "x8" },
      { id: "ex-203", name: "Bent Over Barbell Rows", targetSets: 3, targetReps: "x10" },
      { id: "ex-204", name: "Seated Cable Rows (Wide Grip)", targetSets: 3, targetReps: "x12" },
    ],
  },
];

export const RoutineArchitect: React.FC<RoutineArchitectProps> = ({
  initialTitle = DEFAULT_ROUTINES[0].title,
  initialTargetGroup = DEFAULT_ROUTINES[0].targetGroup,
  initialExercises = DEFAULT_ROUTINES[0].exercises,
  onSave,
}) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState(DEFAULT_ROUTINES[0].id);
  const [title, setTitle] = useState(initialTitle);
  const [targetGroup, setTargetGroup] = useState(initialTargetGroup);
  const [exercises, setExercises] = useState<ArchitectExercise[]>(initialExercises);

  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");

  // Inline Add Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("x10");

  const handleSelectRoutine = (rId: string) => {
    const r = DEFAULT_ROUTINES.find((item) => item.id === rId);
    if (r) {
      setSelectedRoutineId(r.id);
      setTitle(r.title);
      setTargetGroup(r.targetGroup);
      setExercises(r.exercises);
      setSaveStatus("saved");
    }
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= exercises.length) return;

    const updated = [...exercises];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(newIdx, 0, movedItem);

    setExercises(updated);
    setSaveStatus("unsaved");
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
    setSaveStatus("unsaved");
  };

  const updateExerciseField = (id: string, field: "name" | "targetSets" | "targetReps", val: any) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: val } : ex))
    );
    setSaveStatus("unsaved");
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: ArchitectExercise = {
      id: `ex-new-${Date.now()}`,
      name: newExName.trim(),
      targetSets: Number(newExSets) || 3,
      targetReps: newExReps.trim() || "x10",
    };

    setExercises((prev) => [...prev, newEx]);
    setNewExName("");
    setShowAddModal(false);
    setSaveStatus("unsaved");
  };

  const handleSaveRoutine = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      if (onSave) {
        onSave({ title, targetGroup, exercises });
      }
    }, 600);
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-7xl mx-auto">
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-onyx-900 border border-onyx-800 shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purpleGlow/20 text-purpleGlow border border-purpleGlow/30 uppercase tracking-wider">
              Trainer Portal Architect
            </span>
            <span className="text-xs text-slate-400">• Interactive Builder</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Routine Schema Architect</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Pill */}
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 ${
              saveStatus === "saved"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : saveStatus === "saving"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                : "bg-crimson/20 text-crimson border border-crimson/30"
            }`}
          >
            {saveStatus === "saved" && <CheckCircle2 className="w-4 h-4" />}
            <span>{saveStatus === "saved" ? "Saved to Prisma" : saveStatus === "saving" ? "Saving..." : "Unsaved Changes"}</span>
          </span>

          <button
            onClick={handleSaveRoutine}
            disabled={saveStatus === "saving"}
            className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-purpleGlow to-purpleGlow-dark text-white shadow-purple-neon hover:opacity-95 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Save Schema</span>
          </button>
        </div>
      </div>

      {/* Routine Metadata & Selector Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-onyx-900 border border-onyx-800">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Preset Schema</label>
          <select
            value={selectedRoutineId}
            onChange={(e) => handleSelectRoutine(e.target.value)}
            className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purpleGlow"
          >
            {DEFAULT_ROUTINES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.targetGroup})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Routine Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus("unsaved");
            }}
            className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purpleGlow"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Muscle Group</label>
          <input
            type="text"
            value={targetGroup}
            onChange={(e) => {
              setTargetGroup(e.target.value);
              setSaveStatus("unsaved");
            }}
            className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purpleGlow"
          />
        </div>
      </div>

      {/* Full-Width Exercise Table Section */}
      <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-onyx-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purpleGlow" />
            <h3 className="text-base font-bold text-white">Exercise Sequence ({exercises.length})</h3>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-4 bg-purpleGlow/20 text-purpleGlow border border-purpleGlow/30 hover:bg-purpleGlow hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exercise Movement</span>
          </button>
        </div>

        {/* Add Exercise Modal / Form */}
        {showAddModal && (
          <form onSubmit={handleAddExercise} className="p-4 rounded-xl bg-purpleGlow/10 border border-purpleGlow/30 space-y-3">
            <h4 className="text-xs font-bold text-purpleGlow uppercase tracking-wider">New Exercise Definition</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Exercise Name (e.g. Cable Pec Flyes)"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="bg-onyx-950 border border-onyx-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purpleGlow"
              />
              <input
                type="number"
                placeholder="Target Sets (e.g. 3)"
                value={newExSets}
                onChange={(e) => setNewExSets(Number(e.target.value))}
                className="bg-onyx-950 border border-onyx-700 rounded-lg p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Target Reps (e.g. x10-12)"
                value={newExReps}
                onChange={(e) => setNewExReps(e.target.value)}
                className="bg-onyx-950 border border-onyx-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purpleGlow text-white text-xs font-bold rounded-lg hover:opacity-90"
              >
                Add to Sequence
              </button>
            </div>
          </form>
        )}

        {/* Expansive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-onyx-800 uppercase font-semibold">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Exercise Name</th>
                <th className="py-3 px-4">Target Sets</th>
                <th className="py-3 px-4">Target Reps</th>
                <th className="py-3 px-4 text-center">Reorder</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx-800/50">
              {exercises.map((ex, idx) => (
                <tr key={ex.id} className="hover:bg-onyx-850 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => updateExerciseField(ex.id, "name", e.target.value)}
                      className="w-full bg-onyx-950 border border-onyx-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-purpleGlow"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      value={ex.targetSets}
                      onChange={(e) => updateExerciseField(ex.id, "targetSets", Number(e.target.value))}
                      className="w-20 bg-onyx-950 border border-onyx-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purpleGlow"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="text"
                      value={ex.targetReps}
                      onChange={(e) => updateExerciseField(ex.id, "targetReps", e.target.value)}
                      className="w-28 bg-onyx-950 border border-onyx-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purpleGlow"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => moveExercise(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-onyx-700"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveExercise(idx, "down")}
                        disabled={idx === exercises.length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-onyx-700"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="p-1.5 text-slate-400 hover:text-crimson rounded hover:bg-onyx-700"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
