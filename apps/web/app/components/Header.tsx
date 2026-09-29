import type { Task } from "../types";

interface HeaderProps {
  task: Task | null;
  loading: boolean;
}

export function Header({ task, loading }: HeaderProps) {
  const getStatusDisplay = () => {
    if (loading) {
      return { text: "处理中", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (!task) {
      return { text: "准备就绪", color: "bg-slate-50 text-slate-600 border-slate-200" };
    }
    const doneCount = task.steps.filter((s) => s.status === "done").length;
    return {
      text: `已执行 ${doneCount}/${task.steps.length} 步骤`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const status = getStatusDisplay();

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-sm">
            EL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-base">
                EvidenceLab
              </span>
              <span className="text-xs text-slate-400 font-mono">/</span>
              <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                技术选型研究工作台
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              客观求证、多维对比与证据链留存
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-medium text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            演示模式 (Demo Mode)
          </div>

          <div
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.color}`}
          >
            {status.text}
          </div>

          {task && (
            <span className="text-xs font-mono text-slate-400 hidden md:inline truncate max-w-[120px]" title={task.id}>
              ID: {task.id.slice(0, 8)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
