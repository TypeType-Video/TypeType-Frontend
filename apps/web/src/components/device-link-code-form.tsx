import { useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { formatDeviceCodeInput, normalizeDeviceCode } from "../lib/device-link-code";
import { m } from "../paraglide/messages.js";

export function DeviceLinkCodeForm() {
  const navigate = useNavigate();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const code = normalizeDeviceCode(value);

  useEffect(() => input.current?.focus(), []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (code) void navigate({ to: "/link", search: { code } });
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={submit}>
      <label htmlFor={inputId} className="text-sm font-medium text-fg">
        {m.device_link_code_label()}
      </label>
      <input
        ref={input}
        id={inputId}
        value={value}
        onChange={(event) => setValue(formatDeviceCodeInput(event.target.value))}
        placeholder={m.device_link_code_placeholder()}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        maxLength={9}
        className="h-14 rounded-lg border border-border-strong bg-app px-3 text-center font-mono text-2xl tracking-[0.3em] text-fg"
      />
      <button
        type="submit"
        disabled={!code}
        className="h-11 rounded-lg bg-fg text-sm font-medium text-app disabled:opacity-50"
      >
        {m.device_link_continue()}
      </button>
    </form>
  );
}
