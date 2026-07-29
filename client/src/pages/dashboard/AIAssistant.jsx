import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Send, Bot, User, TrendingDown, PieChart, PiggyBank, Lightbulb, Activity } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import aiService from "../../services/ai.service";
import { useAuth } from "../../hooks/useAuth";

// Renders the assistant's markdown reply with chat-bubble-friendly styling
// (tight spacing, small headings, bold amounts, tidy lists/tables).
function MarkdownMessage({ text }) {
  return (
    <div className="markdown-message text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          h1: ({ children }) => <h3 className="mb-1.5 mt-1 text-sm font-extrabold text-slate-900">{children}</h3>,
          h2: ({ children }) => <h3 className="mb-1.5 mt-1 text-sm font-extrabold text-slate-900">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-1 mt-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">{children}</h4>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[#800A38] underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[11px] text-[#800A38]">{children}</code>
          ),
          hr: () => <hr className="my-2.5 border-slate-200" />,
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-[#800A38]/30 pl-3 text-slate-500 italic">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
          th: ({ children }) => <th className="px-2.5 py-1.5 text-left font-bold text-slate-600">{children}</th>,
          td: ({ children }) => <td className="border-t border-slate-100 px-2.5 py-1.5">{children}</td>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

const SUGGESTIONS = [
  { label: "How much did I spend this month?", icon: TrendingDown },
  { label: "Which type of transaction do I use the most?", icon: PieChart },
  { label: "What's my current wallet balance?", icon: PiggyBank },
  { label: "Give me your best saving tips.", icon: Lightbulb },
  { label: "Analyze my recent spending behavior.", icon: Activity },
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi ${user?.fullName?.split(" ")[0] || "there"}! I'm your Atlas AI Financial Assistant. I can see your wallet, linked bank accounts, and recent transactions — ask me anything about them.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const question = (text ?? input).trim();
    if (!question) return;
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    try {
      const reply = await aiService.chat(question, history);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "I couldn't reach the AI assistant right now. Please try again in a moment.";
      setMessages((m) => [...m, { role: "assistant", text: msg }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Financial Assistant"
        crumb="AI Assistant"
        description="Ask questions about your spending, savings, and financial habits."
        action={<Badge tone="primary"><Sparkles className="h-3 w-3" /> Powered by Groq</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chat */}
        <Card noPadding className="lg:col-span-2 flex h-[560px] flex-col">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-[#800A38] text-white" : "bg-rose-50 text-[#800A38]"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-[#800A38] text-white rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                  {m.role === "user" ? m.text : <MarkdownMessage text={m.text} />}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[#800A38]">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 0.12}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2 border-t border-rose-100 p-3 sm:p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending, savings, or budget..."
              className="flex-1 rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#800A38] text-white hover:bg-[#6b0830] disabled:opacity-40 transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </Card>

        {/* Suggested questions */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-slate-900">Try asking</h3>
          <div className="space-y-2.5">
            {SUGGESTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => sendMessage(label)}
                disabled={typing}
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 px-3.5 py-3 text-left text-xs font-semibold text-slate-600 hover:bg-[#800A38] hover:text-white hover:border-[#800A38] transition-all disabled:opacity-50"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
            The assistant reads your wallet, linked accounts, and recent transactions directly from the database to answer — it never sees anyone else's data.
          </p>
        </Card>
      </div>
    </div>
  );
}
