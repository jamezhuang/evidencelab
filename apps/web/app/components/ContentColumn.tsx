import type { Task } from "../types";
import { IconSparkles, IconDatabase } from "./Icons";

interface ContentColumnProps {
  task: Task | null;
}

export function ContentColumn({ task }: ContentColumnProps) {
  if (!task) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-center items-center text-center min-h-[460px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <IconDatabase className="h-7 w-7 text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          等待发起技术选型任务
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          在上方输入框提供你目前面临的技术架构或选型痛点，系统将在此沉淀阶段性分析结论与决策论据。
        </p>
      </section>
    );
  }

  const completedSteps = task.steps.filter((s) => s.status === "done").length;
  const progressPercent = Math.round((completedSteps / (task.steps.length || 1)) * 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm flex flex-col min-h-[460px]">
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Research Target
          </span>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Task #{task.id.slice(0, 8)}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {task.question}
        </h2>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>研究进度达成率</span>
            <span className="font-semibold text-slate-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="my-5 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            当前阶段性发现与综合结论
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 text-sm text-slate-700 leading-relaxed font-normal">
          <p className="whitespace-pre-wrap">{task.finding}</p>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <IconSparkles className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">演示阶段诚实说明</p>
            <p className="text-amber-800/90 leading-relaxed">
              当前任务处于原型演示阶段，系统尚未调用真实 LLM 认知推理及网络搜索工具。展示的步骤与结论由后端内置任务生成，用于验证研究工作台的三栏协同工作流。
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <span>模式: {task.mode}</span>
        <span>可点击右侧来源查验原始技术材料</span>
      </div>
    </section>
  );
}
