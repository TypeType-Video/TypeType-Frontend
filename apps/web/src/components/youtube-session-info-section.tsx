import { m } from "../paraglide/messages.js";

type Props = {
  labelClassName: string;
};

export function YoutubeSessionInfoSection({ labelClassName }: Props) {
  return (
    <section className="grid gap-10 border-border border-b pb-10 lg:grid-cols-[18rem_1fr] xl:grid-cols-[22rem_1fr]">
      <div>
        <p className={labelClassName}>{m.ui_what_happens()}</p>
        <p className="mt-2 text-fg-muted text-sm leading-6">
          {m.ui_the_login_page_is_rendered_by_a_disposable_chromium_session_running_i()}
        </p>
      </div>
      <ul className="flex flex-col gap-4 border-border border-l pl-5 text-fg-muted text-sm leading-6">
        <li>{m.ui_you_sign_in_inside_the_remote_browser_shown_above()}</li>
        <li>{m.ui_cookies_and_playback_token_are_captured_server_side_only()}</li>
        <li>{m.ui_the_browser_context_is_destroyed_after_success_timeout_or_cancel()}</li>
        <li>{m.ui_after_connection_retry_the_video_and_streams_uses_your_youtube_sessio()}</li>
      </ul>
    </section>
  );
}
