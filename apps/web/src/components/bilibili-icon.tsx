import type { SVGProps } from "react";
import { siBilibili } from "simple-icons";

type Props = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function BiliBiliIcon({ title, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...props}
    >
      <path d={siBilibili.path} />
    </svg>
  );
}
