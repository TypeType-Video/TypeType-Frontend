import { PageSpinner } from "./page-spinner";

type Props = {
  notice?: string;
};

export function WatchLoadingIndicator({ notice }: Props) {
  if (!notice) return <PageSpinner fullScreen={false} />;
  return (
    <div className="relative h-full w-full">
      <PageSpinner fullScreen={false} />
      <p
        role="status"
        className="absolute inset-x-0 bottom-4 px-4 text-center text-fg-muted text-sm"
      >
        {notice}
      </p>
    </div>
  );
}
