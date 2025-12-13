"use client";

import { useEffect, useRef, useState } from "react";

const QUICK_ACTIONS = [
  "I'm a parent exploring schools",
  "I'm a teacher or tutor",
  "I'm a student",
  "I'm a school leader",
];

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const SESSION_STORAGE_KEY = "schooldoor-chat-session-id";
const PANEL_SIZE_STORAGE_KEY = "schooldoor-chat-panel-size";
const MIN_WIDTH = 360;
const MAX_WIDTH = 640;
const MIN_HEIGHT = 360;
const MAX_HEIGHT = 700;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelSize, setPanelSize] = useState({ width: 420, height: 520 });
  const [resizeOrigin, setResizeOrigin] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const panelSizeRef = useRef(panelSize);
  const resizeHandleRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelSizeRef.current = panelSize;
  }, [panelSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const generated = self.crypto?.randomUUID
        ? self.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
      setSessionId(generated);
    }

    const storedSize = window.localStorage.getItem(PANEL_SIZE_STORAGE_KEY);
    if (storedSize) {
      try {
        const parsed = JSON.parse(storedSize);
        if (
          typeof parsed?.width === "number" &&
          typeof parsed?.height === "number"
        ) {
          const width = clamp(parsed.width, MIN_WIDTH, MAX_WIDTH);
          const height = clamp(parsed.height, MIN_HEIGHT, MAX_HEIGHT);
          setPanelSize({ width, height });
          panelSizeRef.current = { width, height };
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, isSending]);

  useEffect(() => {
    if (!resizeOrigin) return;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const deltaX = event.clientX - resizeOrigin.x;
      const deltaY = event.clientY - resizeOrigin.y;
      const availableWidth = Math.min(MAX_WIDTH, window.innerWidth - 32);
      const availableHeight = Math.min(
        MAX_HEIGHT,
        Math.floor(window.innerHeight * 0.85),
      );
      const nextWidth = clamp(
        resizeOrigin.width + deltaX,
        MIN_WIDTH,
        availableWidth,
      );
      const nextHeight = clamp(
        resizeOrigin.height + deltaY,
        MIN_HEIGHT,
        availableHeight,
      );
      setPanelSize({ width: nextWidth, height: nextHeight });
    };

    const stopResizing = (event: PointerEvent) => {
      resizeHandleRef.current?.releasePointerCapture?.(event.pointerId);
      setResizeOrigin(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PANEL_SIZE_STORAGE_KEY,
          JSON.stringify(panelSizeRef.current),
        );
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [resizeOrigin]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending || !sessionId) return;

    setMessage("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      setIsSending(true);
      const response = await fetch("/api/alfred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errMessage =
          typeof data?.error === "string"
            ? data.error
            : "Alfred is unavailable right now.";
        setError(errMessage);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: errMessage },
        ]);
        return;
      }

      const data = await response.json();
      const reply =
        typeof data?.reply === "string" && data.reply.trim().length > 0
          ? data.reply.trim()
          : "I didn’t quite catch that. Could you rephrase your question?";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Failed to reach Alfred", err);
      const fallback =
        "We’re having trouble connecting to Alfred. Please try again soon.";
      setError(fallback);
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
    } finally {
      setIsSending(false);
    }
  };

  const startResizing = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    resizeHandleRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setResizeOrigin({
      x: event.clientX,
      y: event.clientY,
      width: panelSizeRef.current.width,
      height: panelSizeRef.current.height,
    });
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      {open && (
        <div
          className="pointer-events-auto relative flex min-h-[360px] flex-col rounded-3xl border border-sd-navy/10 p-6 shadow-surface-lg backdrop-blur"
          style={{
            background: 'linear-gradient(90deg, #FFBC99 0%, #FFDFC9 100%)',
            width: panelSize.width,
            height: panelSize.height,
            maxWidth: "90vw",
            maxHeight: "85vh",
          }}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
                Ask Alfred
              </p>
              <p className="font-heading text-lg text-sd-navy">Let&apos;s talk</p>
              <p className="mt-2 text-xs text-sd-muted">
                Alfred is our co-creation guide. Tell us who you are so we can
                shape the SchoolDoor experience together.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-sd-navy/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sd-muted transition hover:text-sd-navy"
            >
              Close
            </button>
          </header>

          <div className="mt-4 flex flex-1 flex-col space-y-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  type="button"
                  key={action}
                  onClick={() => setMessage(action)}
                  className="rounded-2xl border border-sd-soft-blue/50 bg-sd-soft-blue/40 px-4 py-2 text-left text-xs text-sd-navy transition hover:-translate-y-0.5 hover:border-sd-navy/25"
                >
                  {action}
                </button>
              ))}
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-sd-navy/10 bg-white/70 p-3 text-sm text-sd-ink"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sd-soft-blue font-semibold text-sd-navy">
                  A
                </span>
                <p>
                  Hello again! It&apos;s great to hear from you. To help me
                  understand how SchoolDoor can best serve you, could you share
                  your connection to the education community? Are you a parent, a
                  teacher, a student, a school leader, or something else?
                </p>
              </div>
              {messages.map((msg, index) =>
                msg.role === "user" ? (
                  <div
                    key={`${msg.text}-${index}`}
                    className="flex justify-end text-right"
                  >
                    <p className="inline-flex max-w-[85%] rounded-2xl bg-sd-salmon px-3 py-2 text-white">
                      {msg.text}
                    </p>
                  </div>
                ) : (
                  <div key={`${msg.text}-${index}`} className="flex gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sd-soft-blue font-semibold text-sd-navy">
                      A
                    </span>
                    <p className="max-w-[85%] rounded-2xl bg-sd-soft-blue/40 px-3 py-2 text-left text-sd-ink">
                      {msg.text}
                    </p>
                  </div>
                ),
              )}
              {isSending && (
                <div className="flex gap-3 text-xs text-sd-muted">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sd-soft-blue font-semibold text-sd-navy">
                    …
                  </span>
                  <p>Alfred is typing…</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-sd-salmon">
                {error} If this keeps happening, drop us a note at
                admin@schooldoor.in.
              </p>
            )}
          </div>

          <form
            className="mt-4 flex items-center gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your question..."
              className="h-12 flex-1 rounded-full border border-sd-navy/15 bg-white px-4 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="inline-flex h-12 items-center rounded-full px-5 text-sm font-semibold shadow-surface-sm transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: '#0f9790',
                color: '#ffffff',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSending && message.trim()) {
                  e.currentTarget.style.backgroundColor = '#0c7e78';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSending && message.trim()) {
                  e.currentTarget.style.backgroundColor = '#0f9790';
                }
              }}
            >
              {isSending ? "Sending…" : "Send"}
            </button>
          </form>

          <button
            type="button"
            aria-label="Resize chat window"
            onPointerDown={startResizing}
            className="absolute top-2 left-2 inline-flex h-5 w-5 cursor-nwse-resize items-center justify-center rounded bg-sd-muted/20 text-[0.6rem] text-sd-muted transition hover:bg-sd-muted/30 hover:text-sd-navy"
          >
            ⇱
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full px-10 py-3 text-sm font-semibold shadow-surface-lg transition hover:-translate-y-1"
        style={{
          background: 'linear-gradient(90deg, #FFBC99 0%, #FFDFC9 100%)',
          color: '#993500'
        }}
      >
        <span>Chat</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M22.6383 5.44C23.8113 5.44 24.7633 6.39336 24.7633 7.565V9.69289L26.8883 9.69C28.0613 9.69 29.0133 10.6434 29.0133 11.815V27.1065C29.014 27.387 28.9311 27.6613 28.7752 27.8945C28.6192 28.1277 28.3973 28.309 28.1378 28.4155C27.966 28.4876 27.7815 28.5247 27.5952 28.5246C27.2194 28.5237 26.8592 28.3739 26.5935 28.1081L23.7617 25.2734H11.3049C10.1333 25.2734 9.17993 24.3185 9.17993 23.1455V22.0264L7.34954 23.8595L7.20657 23.9843C6.96011 24.173 6.65848 24.2755 6.34807 24.276C6.16176 24.2759 5.97732 24.2388 5.80543 24.1669C5.54605 24.0602 5.32428 23.8788 5.16837 23.6457C5.01245 23.4126 4.92945 23.1383 4.92993 22.8579V7.565C4.92993 6.39336 5.88329 5.44 7.05493 5.44H22.6383ZM26.8883 11.1066L24.7633 11.1095V18.8984C24.7633 20.0699 23.8113 21.0234 22.6383 21.0234H10.5965V23.1455C10.5965 23.5365 10.9153 23.8566 11.3049 23.8566H24.0549C24.1481 23.8567 24.2404 23.8751 24.3264 23.9108C24.4125 23.9465 24.4906 23.9989 24.5564 24.0649L27.5965 27.1065V11.815C27.5963 11.6272 27.5216 11.4472 27.3888 11.3145C27.2561 11.1817 27.0761 11.1069 26.8883 11.1066ZM22.6383 6.85661H7.05493C6.86722 6.85715 6.68735 6.93196 6.55462 7.06469C6.42189 7.19742 6.34708 7.37729 6.34654 7.565V22.8579L9.38682 19.8164C9.45272 19.7507 9.53064 19.6982 9.61632 19.6619C9.70254 19.6259 9.79493 19.6072 9.88832 19.6066H22.6383C23.0293 19.6066 23.3465 19.2879 23.3465 18.8984V7.565C23.3463 7.37724 23.2716 7.19724 23.1388 7.06445C23.0061 6.93167 22.8261 6.85693 22.6383 6.85661ZM17.6806 13.9402V15.3568H10.5972V13.9402H17.6806ZM19.0974 11.1068V12.5236H10.5974V11.1068H19.0974Z" fill="black"/>
        </svg>
      </button>
    </div>
  );
}
