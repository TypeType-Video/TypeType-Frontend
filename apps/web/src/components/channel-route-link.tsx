import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { ChannelSort } from "../lib/api-discovery";
import {
  channelLegacySearch,
  channelPathSearch,
  toCanonicalChannelRoute,
  toChannelPathParam,
} from "../lib/channel-route-url";

type Props = {
  url: string;
  children: ReactNode;
  className?: string;
  sort?: ChannelSort;
  query?: string;
};

export function ChannelRouteLink({ url, children, className, sort = "latest", query = "" }: Props) {
  const channelId = toChannelPathParam(url);
  const canonicalRoute = toCanonicalChannelRoute(url);

  if (channelId) {
    return (
      <Link
        to="/channel/$channelId"
        params={{ channelId }}
        search={channelPathSearch(sort, query)}
        className={className}
      >
        {children}
      </Link>
    );
  }

  if (canonicalRoute) {
    return (
      <Link
        to="/channel/$provider/$channelId"
        params={{ provider: canonicalRoute.provider, channelId: canonicalRoute.id }}
        search={channelPathSearch(sort, query)}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link to="/channel" search={channelLegacySearch(url, sort, query)} className={className}>
      {children}
    </Link>
  );
}
