type Props = {
  fullScreen?: boolean;
};

export function PageSpinner({ fullScreen = true }: Props) {
  const size = fullScreen ? 120 : 88;
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-app"
    : "flex h-full w-full items-center justify-center bg-app";

  return (
    <div className={wrapperClass}>
      <img src="/loader.gif" width={size} height={size} alt="" />
    </div>
  );
}
