import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CalculatorPanel } from "./calculator-panel";
import { CalculatorGuide } from "./calculator-guide";

const GUIDE_SEEN_KEY = "kadet-calc-guide-seen";

function guideSeen() {
  try {
    return localStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Full-screen calculator for the standalone CTCalculator app. Same panel and
 * guide as the Kadet widget, but the panel fills the viewport instead of
 * floating; `.calc-full` in calculator.css handles the sizing.
 */
export function CalculatorScreen() {
  const [guideOpen, setGuideOpen] = useState(() => !guideSeen());

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {
      /* private mode — show again next time, no harm */
    }
  }, []);

  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeGuide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guideOpen, closeGuide]);

  return (
    <div className="calc-full">
      <CalculatorPanel
        title="CTCalculator"
        onHelp={() => setGuideOpen(true)}
        headerEnd={
          <a className="calc-credit" href="https://github.com/CTechDevWorks" target="_blank" rel="noreferrer">
            CTDW_
          </a>
        }
      />
      <AnimatePresence>{guideOpen ? <CalculatorGuide key="calc-guide" onClose={closeGuide} /> : null}</AnimatePresence>
    </div>
  );
}
