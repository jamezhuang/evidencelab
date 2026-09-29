import { useState, type FormEvent } from "react";

interface QuestionInputProps {
  onSubmit: (question: string) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const PRESET_QUESTIONS = [
  "为内部知识助手选择合适的 Agent 编排框架：LangGraph vs AutoGen vs LlamaIndex",
  "高并发微服务 API 网关选型：Envoy vs Kong vs Traefik",
  "React 技术栈端到端类型安全方案选型：tRPC vs GraphQL vs REST+OpenAPI",
];

export function QuestionInput({ onSubmit, loading, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (question.trim().length < 5 || loading || disabled) return;
    await onSubmit(question.trim());
  };

  const handleSelectPreset = (preset: string) => {
    setQuestion(preset);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label
            htmlFor="research-question"
            className="text-sm font-semibold text-slate-900"
          >
            研究目标或选型问题
          </label>
          <span className="text-xs text-slate-500">
            {question.length > 0 && question.length < 5 ? (
              <span className="text-amber-600">至少需输入 5 个字符</span>
            ) : (
              "建议包含候选对比对象与实际业务约束"
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="research-question"
              name="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：为内部知识助手选择合适的 Agent 编排框架..."
              disabled={loading || disabled}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || disabled || question.trim().length < 5}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                创建任务中...
              </span>
            ) : (
              "发起技术选型研究"
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">参考示例：</span>
        {PRESET_QUESTIONS.map((preset, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            disabled={loading || disabled}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition-colors text-left truncate max-w-full sm:max-w-xs"
          >
            {preset}
          </button>
        ))}
      </div>
    </section>
  );
}
