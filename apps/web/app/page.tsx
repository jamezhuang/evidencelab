"use client";

import { useEffect, useState } from "react";
import type { Task, Step } from "./types";
import { Header } from "./components/Header";
import { QuestionInput } from "./components/QuestionInput";
import { PlanColumn } from "./components/PlanColumn";
import { ContentColumn } from "./components/ContentColumn";
import { SourcesColumn } from "./components/SourcesColumn";

const API_BASE = "http://127.0.0.1:8000";
const STORAGE_TASK_KEY = "evidencelab:last-task-id";

export default function Home() {
  const [task, setTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // 1. 恢复最近任务
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_TASK_KEY);
    if (!savedId) return;

    fetch(`${API_BASE}/tasks/${savedId}`)
      .then((res) => {
        if (!res.ok) throw new Error("无法恢复上次的任务记录");
        return res.json() as Promise<Task>;
      })
      .then((loadedTask) => {
        setTask(loadedTask);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_TASK_KEY);
      });
  }, []);

  // 2. 创建任务
  const handleCreateTask = async (question: string) => {
    setCreating(true);
    setError(null);
    setInfoNotice(null);

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        if (res.status === 422) {
          throw new Error("选型问题过短或格式有误，至少需要输入 5 个字符");
        }
        throw new Error(`创建任务失败（HTTP ${res.status}）。请确认本地 FastAPI 服务已在 ${API_BASE} 运行。`);
      }

      const created = (await res.json()) as Task;
      setTask(created);
      localStorage.setItem(STORAGE_TASK_KEY, created.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "无法连接到后端服务，请检查 http://127.0.0.1:8000 是否启动"
      );
    } finally {
      setCreating(false);
    }
  };

  // 3. 编辑与保存计划
  const handleSavePlan = async (updatedSteps: Step[]) => {
    if (!task) return;
    setSavingPlan(true);
    setError(null);
    setInfoNotice(null);

    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: updatedSteps }),
      });

      if (!res.ok) throw new Error(`后端保存失败（HTTP ${res.status}）`);

      const updatedTask = (await res.json()) as Task;
      setTask(updatedTask);
      setInfoNotice("计划修改已成功同步并持久化至后端。");
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存计划失败";
      setError(message);
      throw err;
    } finally {
      setSavingPlan(false);
    }
  };

  const handleFetchGithubSources = async () => {
    if (!task) return;
    const res = await fetch(`${API_BASE}/tasks/${task.id}/sources/github`, {
      method: "POST",
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.detail || `获取来源失败（HTTP ${res.status}）`);
    }
    setTask((await res.json()) as Task);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      <Header task={task} loading={creating} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <QuestionInput
          onSubmit={handleCreateTask}
          loading={creating}
        />

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">请求异常:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-500 hover:text-red-800 font-medium shrink-0"
            >
              忽略
            </button>
          </div>
        )}

        {infoNotice && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/90 p-4 text-xs sm:text-sm text-blue-800 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">系统状态提示:</span>
              <span>{infoNotice}</span>
            </div>
            <button
              onClick={() => setInfoNotice(null)}
              className="text-xs text-blue-500 hover:text-blue-800 font-medium shrink-0"
            >
              关闭
            </button>
          </div>
        )}

        {/* 桌面端三栏布局，窄屏顺序堆叠 */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_320px] gap-6 items-start">
          <PlanColumn
            task={task}
            onSavePlan={handleSavePlan}
            saving={savingPlan}
          />

          <ContentColumn task={task} />

          <SourcesColumn task={task} onFetchGithubSources={handleFetchGithubSources} />
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>EvidenceLab · 可交互技术选型研究工作台</span>
          <span>遵循客观求证与证据链透明原则 · 演示工程</span>
        </div>
      </footer>
    </div>
  );
}
