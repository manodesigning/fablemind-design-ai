import clsx from 'clsx';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-white/5', className)}
      {...props}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Skeleton className="w-4 h-4 rounded shrink-0" />
      <Skeleton className="h-3 flex-1" />
    </div>
  );
}
