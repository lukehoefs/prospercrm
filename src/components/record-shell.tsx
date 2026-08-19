export function RecordShell({
  header,
  about,
  activity,
  related,
}: {
  header: React.ReactNode;
  about: React.ReactNode;
  activity: React.ReactNode;
  related: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">{header}</div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="order-2 space-y-4 border-b border-slate-200 bg-white p-4 lg:order-1 lg:border-b-0 lg:border-r">
          {about}
        </aside>
        <section className="order-1 min-w-0 space-y-4 p-4 sm:p-5 lg:order-2">{activity}</section>
        <aside className="order-3 space-y-4 border-t border-slate-200 bg-white p-4 lg:border-t-0 lg:border-l">
          {related}
        </aside>
      </div>
    </div>
  );
}

export function RecordSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
