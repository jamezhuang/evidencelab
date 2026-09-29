import { useState } from "react";
import type { Task, Source } from "../types";
import { IconExternalLink, IconStar } from "./Icons";

interface SourcesColumnProps {
  task: Task | null;
  onFetchGithubSources?: () => Promise<void>;
}

export function SourcesColumn({ task, onFetchGithubSources }: SourcesColumnProps) {
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubNotice, setGithubNotice] = useState<string | null>(null);

  const handleFetchGithub = async () => {
    if (!task) return;
    setGithubLoading(true);
    setGithubNotice(null);

    try {
      if (!onFetchGithubSources) throw new Error("未配置 GitHub 来源接口");
      await onFetchGithubSources();
      setGithubNotice("GitHub 来源数据已检索并更新。");
    } catch (err) {
      setGithubNotice(err instanceof Error ? err.message : "获取来源失败");
    } finally {
      setGithubLoading(false);
    }
  };

  const sources: Source[] = task?.sources || [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>证据来源</span>
            {task && (
              <span className="text-xs px-2 py-0.5 font-normal rounded bg-slate-100 text-slate-600">
                {sources.length} 条
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">选型决策的原始支撑依据</p>
        </div>
      </div>

      {!task ? (
        <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
          <p className="text-sm font-medium text-slate-700">暂无关联材料</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            创建选型任务后在此查看官方文档、开源仓库及基准测试证据
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {sources.length === 0 ? (
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 text-center my-4">
                <p className="text-xs font-medium text-slate-700">
                  当前任务尚未捕获证据来源
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  可在下方尝试调用检索扩展，或等待后续步骤执行
                </p>
              </div>
            ) : (
              sources.map((src, index) => (
                <div
                  key={`${src.url}-${index}`}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 break-words leading-tight flex-1">
                      {src.title}
                    </h3>
                    <span className="shrink-0 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      {src.type}
                    </span>
                  </div>

                  {src.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 break-words">
                      {src.description}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1">
                    <div className="flex items-center gap-2">
                      {typeof src.stars === "number" && (
                        <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                          <IconStar className="h-3 w-3" />
                          {src.stars.toLocaleString()}
                        </span>
                      )}
                      {src.archived && (
                        <span className="text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded text-[10px]">
                          已归档
                        </span>
                      )}
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 hover:underline font-medium ml-auto"
                    >
                      <span>打开原网页</span>
                      <IconExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              disabled={githubLoading}
              onClick={handleFetchGithub}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800 transition-colors disabled:opacity-50"
            >
              {githubLoading ? "正在请求后端..." : "获取 GitHub 项目资料"}
            </button>

            {githubNotice && (
              <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 leading-relaxed border border-slate-200/70">
                {githubNotice}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
