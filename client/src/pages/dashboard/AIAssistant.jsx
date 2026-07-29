import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Bot, User, TrendingDown, PieChart, PiggyBank, Lightbulb, Activity } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  MONTHLY_SPENDING,
  INCOME_VS_EXPENSE,
  CATEGORY_SPENDING,
  formatCurrency,
} from "../../data/mockData";

const SUGGESTIONS = [
  { label: "How much did I spend this month?", icon: TrendingDown },
  { label: "Which category do I spend the most on?", icon: PieChart },
  { label: "How much can I save next month?", icon: PiggyBank },
  { label: "Give me your best saving tips.", icon: Lightbulb },
  { label: "Analyze my spending behavior.", icon: Activity },
];

// Lightweight canned-response engine — swap for a real LLM/analytics API call
// once the backend endpoint is ready. Keeps the UI fully functional today.
function generateReply(question) {
  const q = question.toLowerCase();
  const thisMonth = MONTHLY_SPENDING[MONTHLY_SPENDING.length - 1];
  const topCategory = [...CATEGORY_SPENDING].sort((a, b) => b.value - a.value)[0];
  const latest = INCOME_VS_EXPENSE[INCOME_VS_EXPENSE.length - 1];
  const projectedSavings = Math.max(latest.income - latest.expense, 0);

  if (q.includes("spend") && (q.includes("month") || q.includes("this"))) {
    return `You've spent ${formatCurrency(thisMonth.amount)} so far in ${thisMonth.month}. That's roughly in line with your last few months, so nothing looks unusual.`;
  }
  if (q.includes("category")) {
    return `Your top spending category is "${topCategory.name}" at ${formatCurrency(topCategory.value)}. Reducing this by even 10% could free up meaningful savings each month.`;
  }
  if (q.includes("save") && q.includes("next")) {
    return `Based on your recent income vs expense trend, you could realistically save around ${formatCurrency(projectedSavings)} next month if your spending stays steady.`;
  }
  if (q.includes("tip")) {
    return `A few tips: automate a fixed transfer to savings right after payday, review subscriptions you rarely use, and set a monthly cap for your top spending category ("${topCategory.name}").`;
  }
  if (q.includes("behavior") || q.includes("analy")) {
    return `Your spending is fairly stable month-to-month, with "${topCategory.name}" consistently your biggest category. Income comfortably covers expenses, leaving healthy room for savings.`;
  }
  return `I looked at your recent transactions and spending patterns — could you tell me a bit more about what you'd like to know? Try asking about monthly spending, top categories, or saving tips.`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi Tanvir! I'm your Atlas AI Financial Assistant. Ask me anything about your spending, savings, or budget." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const question = (text ?? input).trim();
    if (!question) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: generateReply(question) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div>
      <PageHeader
        title="AI Financial Assistant"
        crumb="AI Assistant"
        description="Ask questions about your spending, savings, and financial habits."
        action={<Badge tone="primary"><Sparkles className="h-3 w-3" /> Future AI Module</Badge>}
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
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[#800A38] text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                  {m.text}
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
              disabled={!input.trim()}
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
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 px-3.5 py-3 text-left text-xs font-semibold text-slate-600 hover:bg-[#800A38] hover:text-white hover:border-[#800A38] transition-all"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
            The assistant currently analyzes your recent transactions and charts. A smarter, fully personalized model is on the way.
          </p>
        </Card>
      </div>
    </div>
  );
}
