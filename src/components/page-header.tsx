export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.375rem] font-semibold tracking-tight text-navy">{title}</h1>
        {description && (
          <p className="mt-0.5 max-w-2xl text-[13px] text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
