import { ChevronRight } from "lucide-react";

export default function PageHeader({ title, crumb, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
          <span>Dashboard</span>
          {crumb && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#800A38]">{crumb}</span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
        {description && <p className="mt-1 text-xs sm:text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
