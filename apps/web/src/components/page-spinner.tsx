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
      <img className="loading-mascot" src="/loader-mascot.png" width={size} height={size} alt="" />
    </div>
  );
}
