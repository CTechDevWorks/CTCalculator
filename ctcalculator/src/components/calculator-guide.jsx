import { useEffect, useRef } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

const EASE_OUT_SPACE = [0.16, 1, 0.3, 1];

const SECTIONS = [
  {
    title: "Basics",
    rows: [
      { keys: ["Tap", "Type"], text: "Tap the keys or type straight into the display — both work together." },
      { keys: ["Enter", "="], text: "Evaluate the expression." },
      { keys: ["⌫"], text: "Delete one character. After a result it clears the display." },
      { keys: ["C", "Shift + C"], text: "Clear everything." },
      { keys: ["Esc"], text: "Close the calculator." },
    ],
  },
  {
    title: "Shift key",
    rows: [
      { keys: ["Shift", "sin"], text: "Press Shift, then a key, to get the small function printed under it — sin⁻¹, cos⁻¹, tan⁻¹." },
      { keys: ["Shift", "log"], text: "Antilog: inserts 10^( so you can find a number from its log." },
      { keys: ["Shift", "ln"], text: "Inserts e^( — the inverse of the natural log." },
      { keys: ["Once"], text: "Shift switches itself off after one key, like a real calculator." },
    ],
  },
  {
    title: "Degrees or radians",
    rows: [
      { keys: ["DEG", "RAD"], text: "Tap the DEG/RAD switch above the display to change the angle unit for sin, cos, tan and their inverses." },
      { keys: ["Tip"], text: "WAEC, NECO and JAMB questions use degrees unless they say otherwise — DEG is the default." },
    ],
  },
  {
    title: "Functions",
    rows: [
      { keys: ["√", "∛"], text: "Square and cube root: √(144) → 12, ∛(27) → 3." },
      { keys: ["^", "×10ˣ"], text: "Powers and standard form: 2^10, 3.2×10^5." },
      { keys: ["n!"], text: "Factorial — type the number first: 5! → 120." },
      { keys: ["nPr", "nCr"], text: "Permutations and combinations use a comma: nPr(6,2) → 30, nCr(6,2) → 15." },
      { keys: ["log", "ln"], text: "log is base 10, ln is the natural log (base e)." },
      { keys: ["π", "e"], text: "Constants — π ≈ 3.1416, e ≈ 2.7183." },
      { keys: ["%"], text: "Remainder (modulo): 17 % 5 → 2." },
    ],
  },
  {
    title: "Surds",
    rows: [
      { keys: ["√(500)"], text: "Roots that don't simplify to a whole number stay exact: √(500) → 10√5, √(8)+√(2) → 3√2. The decimal value shows underneath." },
      { keys: ["1÷√(2)"], text: "Denominators are rationalised for you: 1÷√(2) → √2/2, 2÷(√(3)−1) → √3 + 1." },
      { keys: ["Mixed"], text: "Mix a surd with π, trig or logs and you get the usual decimal answer instead." },
    ],
  },
  {
    title: "Working faster",
    rows: [
      { keys: ["Ans"], text: "Re‑uses your last answer. Pressing an operator right after = also continues from it." },
      { keys: ["( )"], text: "Group terms exactly as you would on paper: (3+4)×2." },
      { keys: ["Error"], text: "If you see ⚠️ Error, check for a missing bracket or comma, then press ⌫ or C to start again." },
    ],
  },
];

export function CalculatorGuide({ onClose }) {
  const reduced = useReducedMotion();
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <>
      <Motion.div
        className="calc-guide-scrim"
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      {/* Centering layer — the card itself never carries a transform for layout,
          so motion's animated transform can't knock it off-centre. */}
      <div className="calc-guide-layer">
        <Motion.div
          className="calc-guide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calc-guide-title"
          initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
          transition={{ duration: 0.3, ease: EASE_OUT_SPACE }}
        >
          <header className="calc-guide-header">
            <div>
              <p className="calc-guide-eyebrow">Field manual</p>
              <h2 id="calc-guide-title" className="calc-guide-title">
                Get the most out of the calculator
              </h2>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="calc-icon-btn" aria-label="Close guide">
              <X size={16} strokeWidth={2} />
            </button>
          </header>

          <div className="calc-guide-body">
            {SECTIONS.map((section) => (
              <section key={section.title} className="calc-guide-section">
                <h3 className="calc-guide-section-title">{section.title}</h3>
                <ul className="calc-guide-list">
                  {section.rows.map((row) => (
                    <li key={row.text} className="calc-guide-row">
                      <span className="calc-guide-keys">
                        {row.keys.map((k) => (
                          <kbd key={k}>{k}</kbd>
                        ))}
                      </span>
                      <span className="calc-guide-text">{row.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="calc-guide-footer">
            <p className="calc-guide-note">Reopen this any time with the ? button in the calculator header.</p>
            <button type="button" onClick={onClose} className="calc-guide-cta">
              Got it
            </button>
          </footer>
        </Motion.div>
      </div>
    </>
  );
}
