import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import { Calculator as CalculatorIcon, X } from "lucide-react";
import { CalculatorGuide } from "./calculator-guide";

// math.js is heavy — only fetch it the first time the widget opens.
const CalculatorPanel = lazy(() => import("./calculator-panel").then((m) => ({ default: m.CalculatorPanel })));

const EASE_OUT_SPACE = [0.16, 1, 0.3, 1];
const GUIDE_SEEN_KEY = "kadet-calc-guide-seen";

function guideSeen() {
  try {
    return localStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Floating scientific calculator. A round launcher sits bottom-right; tapping
 * it opens the calculator as a floating card (desktop / landscape) or a bottom
 * sheet (phone / portrait tablet). The usage guide opens automatically the
 * first time, then via the ? button.
 *
 * @param {{ lift?: boolean; defaultOpen?: boolean }} props
 *  - lift: keep the launcher clear of a page's own bottom UI.
 *  - defaultOpen: start with the calculator showing (used by the standalone app).
 */
export function CalculatorWidget({ lift, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [guideOpen, setGuideOpen] = useState(() => defaultOpen && !guideSeen());
  const reduced = useReducedMotion();

  const close = useCallback(() => {
    setGuideOpen(false);
    setOpen(false);
  }, []);

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {
      /* private mode — show again next time, no harm */
    }
  }, []);

  const toggle = useCallback(() => {
    setOpen((wasOpen) => {
      if (wasOpen) {
        setGuideOpen(false);
        return false;
      }
      if (!guideSeen()) setGuideOpen(true);
      return true;
    });
  }, []);

  // Esc closes the guide first, then the calculator.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (guideOpen) closeGuide();
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, guideOpen, close, closeGuide]);

  return (
    <div className="calc-widget" data-lift={lift || undefined} data-open={open || undefined}>
      <AnimatePresence>
        {open ? (
          <>
            {/* Tap-away layer — only visible on the sheet layout */}
            <Motion.div
              key="calc-scrim"
              className="calc-scrim"
              onClick={close}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <Motion.div
              key="calc-panel"
              className="calc-panel-wrap"
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.28, ease: EASE_OUT_SPACE }}
            >
              <Suspense fallback={<div className="calc-panel calc-panel-loading" aria-busy />}>
                <CalculatorPanel onClose={close} onHelp={() => setGuideOpen(true)} />
              </Suspense>
            </Motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{open && guideOpen ? <CalculatorGuide key="calc-guide" onClose={closeGuide} /> : null}</AnimatePresence>

      <button
        type="button"
        className="calc-fab"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close calculator" : "Open calculator"}
        title="Calculator"
      >
        {open ? <X size={20} strokeWidth={2} /> : <CalculatorIcon size={20} strokeWidth={1.9} />}
      </button>
    </div>
  );
}
