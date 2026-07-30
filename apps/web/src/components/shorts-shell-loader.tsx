import { PageSpinner } from "./page-spinner";

type Props = {
  sectionClass: string;
};

export function ShortsShellLoader({ sectionClass }: Props) {
  return (
    <section className={sectionClass}>
      <div className="relative flex h-full items-center justify-center">
        <div className="shorts-shell shorts-frame relative mx-auto max-w-full overflow-hidden rounded-lg bg-black shadow-lg sm:rounded-xl">
          <PageSpinner fullScreen={false} />
        </div>
      </div>
    </section>
  );
}
