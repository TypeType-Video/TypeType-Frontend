import { PageSpinner } from "./page-spinner";

type Props = {
  sectionClass: string;
};

export function ShortsShellLoader({ sectionClass }: Props) {
  return (
    <section className={sectionClass}>
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div className="shorts-stage relative max-h-full max-w-full">
          <div className="shorts-shell shorts-frame relative overflow-hidden rounded-lg bg-black shadow-xl">
            <PageSpinner fullScreen={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
