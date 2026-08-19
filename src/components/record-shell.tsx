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
    <div className="flex min-h-[calc(100vh)] flex-col bg-background">
      <div className="border-b border-border bg-card px-4 py-3.5 sm:px-5">{header}</div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="order-2 space-y-5 border-b border-border bg-card p-4 lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
          {about}
        </aside>
        <section className="order-1 min-w-0 space-y-4 bg-background p-4 sm:p-5 lg:order-2 lg:min-h-0 lg:overflow-y-auto">
          {activity}
        </section>
        <aside className="order-3 space-y-5 border-t border-border bg-card p-4 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
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
        <h2 className="text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
