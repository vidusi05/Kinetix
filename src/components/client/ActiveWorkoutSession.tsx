"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, CheckCircle2, Trophy, Clock, X, Dumbbell, Flame, BarChart2, ShieldCheck } from "lucide-react";
import { useNotification } from "@/components/providers/NotificationProvider";

export interface WorkoutSetLogItem {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetReps: string;
  repsCompleted: number;
  weightLbs: number;
  isCompleted: boolean;
}

export interface ActiveWorkoutSessionProps {
  routineTitle?: string;
  targetGroup?: string;
  exercises?: Array<{
    id: string;
    name: string;
    targetSets: number;
    targetReps: string;
  }>;
  onComplete?: (durationSeconds: number, setLogs: WorkoutSetLogItem[]) => void;
  onCancel?: () => void;
}

const DEFAULT_EXERCISES = [
  { id: "ex-1", name: "Barbell Bench Press", targetSets: 3, targetReps: "x10" },
  { id: "ex-2", name: "Incline Dumbbell Chest Press", targetSets: 3, targetReps: "x8-12" },
  { id: "ex-3", name: "Overhead Barbell Press", targetSets: 3, targetReps: "x10" },
  { id: "ex-4", name: "Weighted Chest Dips", targetSets: 3, targetReps: "x Max reps" },
  { id: "ex-5", name: "Skull Crushers (EZ Bar)", targetSets: 3, targetReps: "x12" },
];

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  routineTitle = "Hypertrophy Push Alpha",
  targetGroup = "Chest, Shoulders & Triceps",
  exercises = DEFAULT_EXERCISES,
  onComplete,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Initialize Set Logs
  const [setLogs, setSetLogs] = useState<WorkoutSetLogItem[]>(() => {
    const logs: WorkoutSetLogItem[] = [];
    exercises.forEach((ex) => {
      for (let s = 1; s <= ex.targetSets; s++) {
        logs.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          setNumber: s,
          targetReps: ex.targetReps,
          repsCompleted: 10,
          weightLbs: 135,
          isCompleted: false,
        });
      }
    });
    return logs;
  });

  // Stopwatch Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSetComplete = (index: number) => {
    setSetLogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isCompleted: !updated[index].isCompleted };
      return updated;
    });
  };

  const updateSetValue = (index: number, field: "weightLbs" | "repsCompleted", value: number) => {
    setSetLogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: Math.max(0, value) };
      return updated;
    });
  };

  // Calculations
  const completedCount = setLogs.filter((s) => s.isCompleted).length;
  const totalSetsCount = setLogs.length;
  const progressPercent = totalSetsCount > 0 ? Math.round((completedCount / totalSetsCount) * 100) : 0;
  const totalVolumeLbs = setLogs
    .filter((s) => s.isCompleted)
    .reduce((acc, s) => acc + s.weightLbs * s.repsCompleted, 0);

  const { showModal } = useNotification();

  const handleFinishSession = () => {
    setIsActive(false);
    if (onComplete) {
      onComplete(seconds, setLogs);
    } else {
      showModal({
        title: "🎉 Workout Completed!",
        message: `Duration: ${formatTime(seconds)}\nTotal Volume: ${totalVolumeLbs} lbs`,
        type: "success",
        confirmText: "Great Job!",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-7xl mx-auto">
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-onyx-900 border border-onyx-800 shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-crimson/20 text-crimson border border-crimson/30 uppercase tracking-wider">
              Live Session Mode
            </span>
            <span className="text-xs text-slate-400">• {targetGroup}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{routineTitle}</h1>
        </div>

        {/* Live Timer & Finish Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-onyx-950 border border-onyx-800">
            <Clock className="w-5 h-5 text-crimson animate-pulse" />
            <span className="text-2xl font-black font-mono text-white tracking-widest">
              {formatTime(seconds)}
            </span>
            <button
              onClick={() => setIsActive(!isActive)}
              className="p-2 rounded-lg bg-onyx-800 hover:bg-onyx-700 text-slate-300 transition"
              title={isActive ? "Pause Timer" : "Resume Timer"}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleFinishSession}
            className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-red-neon hover:opacity-95 transition flex items-center space-x-2"
          >
            <Trophy className="w-5 h-5" />
            <span>Finish Session</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="p-4 rounded-xl bg-onyx-900 border border-onyx-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Total Routine Completion</span>
          <span className="text-crimson">
            {progressPercent}% ({completedCount}/{totalSetsCount} Sets Completed)
          </span>
        </div>
        <div className="w-full h-3 bg-onyx-950 rounded-full overflow-hidden border border-onyx-800">
          <div
            className="h-full bg-gradient-to-r from-crimson-dark via-crimson to-purpleGlow transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop Dashboard Grid (3/4 Left Content, 1/4 Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Full-Width Exercise Tables (3 Columns on Desktop) */}
        <div className="lg:col-span-3 space-y-6">
          {exercises.map((ex) => {
            const exSets = setLogs
              .map((item, idx) => ({ ...item, globalIndex: idx }))
              .filter((item) => item.exerciseId === ex.id);

            return (
              <div key={ex.id} className="p-5 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-onyx-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-purpleGlow/10 text-purpleGlow border border-purpleGlow/30">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{ex.name}</h3>
                      <p className="text-xs text-slate-400">Target: {ex.targetSets} sets • {ex.targetReps}</p>
                    </div>
                  </div>
                </div>

                {/* Full-Width Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-onyx-800 uppercase font-semibold">
                        <th className="py-2.5 px-3">Set</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Weight (lbs)</th>
                        <th className="py-2.5 px-3">Reps Completed</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-onyx-800/50">
                      {exSets.map((setItem) => (
                        <tr
                          key={setItem.globalIndex}
                          className={`transition ${
                            setItem.isCompleted ? "bg-emerald-950/20" : "hover:bg-onyx-850"
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-white">Set {setItem.setNumber}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono">{setItem.targetReps}</td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={setItem.weightLbs}
                              onChange={(e) => updateSetValue(setItem.globalIndex, "weightLbs", Number(e.target.value))}
                              className="w-24 bg-onyx-950 border border-onyx-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-crimson"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={setItem.repsCompleted}
                              onChange={(e) => updateSetValue(setItem.globalIndex, "repsCompleted", Number(e.target.value))}
                              className="w-20 bg-onyx-950 border border-onyx-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-crimson"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => toggleSetComplete(setItem.globalIndex)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ml-auto ${
                                setItem.isCompleted
                                  ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/50"
                                  : "bg-onyx-800 text-slate-400 hover:text-white hover:bg-onyx-700"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{setItem.isCompleted ? "Completed" : "Mark Set"}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Session Analytics Panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4">
            <div className="flex items-center space-x-2 text-crimson">
              <BarChart2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Live Volume Metrics</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-onyx-950 border border-onyx-800">
                <span className="text-xs text-slate-400 block">Total Work Volume</span>
                <span className="text-2xl font-black text-white font-mono">{totalVolumeLbs.toLocaleString()} lbs</span>
              </div>

              <div className="p-3 rounded-xl bg-onyx-950 border border-onyx-800">
                <span className="text-xs text-slate-400 block">Sets Logged</span>
                <span className="text-xl font-bold text-crimson font-mono">{completedCount} / {totalSetsCount}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-3">
            <div className="flex items-center space-x-2 text-purpleGlow">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Coach Notes & Protocol</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain strict form on bench press. Keep 1-2 reps in reserve (RPE 8) on heavy sets. Rest 90-120 seconds between sets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
