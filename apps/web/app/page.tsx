"use client";

import { useEffect, useState, type FormEvent } from "react";

type Step = {
  id: number;
  title: string;
  status: "done" | "active" | "pending";
};

type Source = {
  title: string;
  url: string;
  type: string;
};

type Task = {
  id: string;
  question: string;
  mode: string;
  steps: Step[];
  finding: string;
  sources: Source[];
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const savedId = localStorage.getItem("evidencelab:last-task-id");
    if (!savedId) return;

    fetch(`http://127.0.0.1:8000/tasks/${savedId}`)
      .then((response) => {
        if (!response.ok) throw new Error("无法恢复上次的任务");
        return response.json() as Promise<Task>;
      })
      .then(setTask)
      .catch(() => localStorage.removeItem("evidencelab:last-task-id"));
  }, []);
  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 422
            ? "问题至少需要输入 5 个字符"
            : "创建任务失败，请检查后端是否运行",
        );
      }

      const created = (await response.json()) as Task;
      setTask(created);
      localStorage.setItem("evidencelab:last-task-id", created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-blue-700">EvidenceLab</p>
          <h1 className="mt-1 text-2xl font-bold">技术选型研究工作台</h1>
          <p className="mt-2 text-slate-600">
            输入研究问题，创建一项可追溯的研究任务。
          </p>
        </header>

        <form
          onSubmit={createTask}
          className="mb-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例如：为内部知识助手选择合适的 Agent 框架"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || question.trim().length < 5}
            className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "创建中..." : "开始研究"}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">研究计划</h2>
            {task ? (
              <ol className="space-y-4">
                {task.steps.map((step) => (
                  <li key={step.id} className="text-sm">
                    <span className="mr-2 text-blue-700">{step.id}.</span>
                    {step.title}
                    <span className="mt-1 block pl-5 text-xs text-slate-500">
                      {step.status === "done" ? "已完成" : "待开始"}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">创建任务后显示计划</p>
            )}
          </section>

          <section className="min-h-96 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold">研究内容</h2>
            {task ? (
              <>
                <p className="mt-4 font-medium">{task.question}</p>
                <p className="mt-5 leading-8 text-slate-600">{task.finding}</p>
                <p className="mt-8 text-xs text-amber-700">
                  当前为演示模式，尚未调用模型或搜索工具。
                </p>
              </>
            ) : (
              <p className="mt-5 text-slate-500">输入问题，开始第一项研究。</p>
            )}
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">证据来源</h2>
            {task && task.sources.length > 0 ? (
              <ul className="space-y-3">
                {task.sources.map((source) => (
                  <li
                    key={source.title}
                    className="rounded-lg border p-3 text-sm"
                  >
                    {source.title} · {source.type}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">真实检索后在这里展示来源</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
