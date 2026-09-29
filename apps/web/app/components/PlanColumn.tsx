import { useState } from "react";
import type { Task, Step, StepStatus } from "../types";
import { IconCheck, IconClock, IconPlay, IconEdit } from "./Icons";

interface PlanColumnProps {
  task: Task | null;
  onSavePlan: (steps: Step[]) => Promise<void>;
  saving: boolean;
}

export function PlanColumn({ task, onSavePlan, saving }: PlanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableSteps, setEditableSteps] = useState<Step[]>([]);
  const [editError, setEditError] = useState("");

  const handleStartEdit = () => {
    if (!task) return;
    setEditableSteps(task.steps.map((s) => ({ ...s })));
    setIsEditing(true);
    setEditError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditError("");
  };

  const handleStepTitleChange = (index: number, newTitle: string) => {
    const next = [...editableSteps];
    next[index] = { ...next[index], title: newTitle };
    setEditableSteps(next);
  };

  const handleStepStatusChange = (index: number, newStatus: StepStatus) => {
    const next = [...editableSteps];
    next[index] = { ...next[index], status: newStatus };
    setEditableSteps(next);
  };

  const handleAddStep = () => {
    const newId = editableSteps.length > 0 ? Math.max(...editableSteps.map((s) => s.id)) + 1 : 1;
    setEditableSteps([
      ...editableSteps,
      { id: newId, title: "新增研究步骤", status: "pending" },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (editableSteps.length <= 1) {
      setEditError("至少需要保留 1 个研究步骤");
      return;
    }
    const next = editableSteps.filter((_, i) => i !== index);
    setEditableSteps(next);
  };

  const handleSave = async () => {
    if (editableSteps.some((s) => !s.title.trim())) {
      setEditError("每个步骤的标题均不能为空");
      return;
    }
    setEditError("");
    try {
      await onSavePlan(editableSteps);
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "保存计划失败");
    }
  };

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case "done":
        return {
          icon: <IconCheck className="h-4 w-4" />,
          label: "已完成",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          nodeBg: "bg-emerald-600 text-white",
        };
      case "active":
        return {
          icon: <IconPlay className="h-3.5 w-3.5 animate-pulse" />,
          label: "进行中",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          nodeBg: "bg-blue-600 text-white",
        };
      case "pending":
      default:
        return {
          icon: <IconClock className="h-4 w-4" />,
          label: "待开展",
          bg: "bg-slate-50 text-slate-500 border-slate-200",
          nodeBg: "bg-slate-200 text-slate-600",
        };
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>研究计划</span>
            {task && (
              <span className="text-xs px-2 py-0.5 font-normal rounded bg-slate-100 text-slate-600">
                {task.steps.length} 个步骤
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">任务执行与阶段分解</p>
        </div>

        {task && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <IconEdit className="h-3.5 w-3.5" />
            编辑计划
          </button>
        )}
      </div>

      {!task ? (
        <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <IconClock className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">暂无进行中的计划</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            在上方输入技术选型问题并创建任务，即可生成分解步骤
          </p>
        </div>
      ) : isEditing ? (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {editableSteps.map((step, idx) => (
              <div
                key={step.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    步骤 {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={step.status}
                      onChange={(e) =>
                        handleStepStatusChange(idx, e.target.value as StepStatus)
                      }
                      className="text-xs rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 outline-none"
                    >
                      <option value="pending">待开展</option>
                      <option value="active">进行中</option>
                      <option value="done">已完成</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-xs text-red-600 hover:text-red-700 p-1"
                      title="删除步骤"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                  placeholder="步骤描述"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddStep}
              className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              + 添加新步骤
            </button>

            {editError && (
              <p className="text-xs text-red-600 font-medium">{editError}</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {saving ? "保存中..." : "保存修改"}
            </button>
          </div>
        </div>
      ) : (
        <ol className="relative space-y-4 my-1 overflow-y-auto pr-1">
          {task.steps.map((step, idx) => {
            const isLast = idx === task.steps.length - 1;
            const badge = getStatusBadge(step.status);
            return (
              <li key={step.id} className="relative flex items-start gap-3 group">
                {!isLast && (
                  <span
                    className="absolute left-[15px] top-[26px] -bottom-[16px] w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors"
                    aria-hidden="true"
                  />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-transform ${badge.nodeBg}`}
                >
                  {step.status === "done" ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-sm font-medium text-slate-800 break-words leading-tight">
                      {step.title}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none ${badge.bg}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
