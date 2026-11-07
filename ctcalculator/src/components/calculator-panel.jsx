import { useEffect, useRef } from "react";
import { CircleHelp, Delete, X } from "lucide-react";
import { useCalculator } from "./use-calculator";

/**
 * 6 × 7 grid. The number block (7‑8‑9 / 4‑5‑6 / 1‑2‑3 / 0 .) and the trig
 * trio (sin cos tan) are each kept contiguous; functions sit above, operators
 * to the right, and a 2 × 2 "=" anchors the bottom‑right corner.
 *
 * Insert keys: { label, value, kind: "number" | "special", aria?, shift?, span? }
 * Action keys: { label, action: "shift" | "clear" | "backspace" | "equals", kind: "high" | "shift", aria?, span? }
 */
const KEYS = [
  // Row 1 — control
  { label: "Shift", action: "shift", kind: "shift", aria: "Shift — use the small function on a key" },
  { label: "(", value: "(", kind: "special" },
  { label: ")", value: ")", kind: "special" },
  { label: "%", value: "%", kind: "special", aria: "modulo" },
  { label: "C", action: "clear", kind: "high", aria: "Clear (Shift+C)" },
  { label: "⌫", action: "backspace", kind: "high", aria: "Backspace" },

  // Row 2 — trig + logs
  { label: "sin", value: "sin(", kind: "special", shift: { label: "sin⁻¹", value: "sin⁻¹(", aria: "inverse sine" } },
  { label: "cos", value: "cos(", kind: "special", shift: { label: "cos⁻¹", value: "cos⁻¹(", aria: "inverse cosine" } },
  { label: "tan", value: "tan(", kind: "special", shift: { label: "tan⁻¹", value: "tan⁻¹(", aria: "inverse tangent" } },
  { label: "log", value: "log(", kind: "special", aria: "log base 10", shift: { label: "10ˣ", value: "10^(", aria: "antilog — ten to the power" } },
  { label: "ln", value: "ln(", kind: "special", aria: "natural log", shift: { label: "eˣ", value: "e^(", aria: "e to the power" } },
  { label: "π", value: "π", kind: "special", aria: "pi" },

  // Row 3 — counting + roots
  { label: "n!", value: "!", kind: "special", aria: "factorial" },
  { label: "nPr", value: "nPr(", kind: "special", aria: "permutations" },
  { label: "nCr", value: "nCr(", kind: "special", aria: "combinations" },
  { label: "e", value: "e", kind: "special", aria: "Euler's number" },
  { label: "√", value: "√(", kind: "special", aria: "square root" },
  { label: "∛", value: "∛(", kind: "special", aria: "cube root" },

  // Rows 4–7 — number block left, operators right
  { label: "7", value: "7", kind: "number" },
  { label: "8", value: "8", kind: "number" },
  { label: "9", value: "9", kind: "number" },
  { label: "^", value: "^", kind: "special", aria: "power" },
  { label: "×", value: "×", kind: "special", aria: "multiply" },
  { label: "÷", value: "÷", kind: "special", aria: "divide" },

  { label: "4", value: "4", kind: "number" },
  { label: "5", value: "5", kind: "number" },
  { label: "6", value: "6", kind: "number" },
  { label: "×10ˣ", value: "×10^", kind: "special", aria: "times ten to the power" },
  { label: "+", value: "+", kind: "special", aria: "plus" },
  { label: "−", value: "-", kind: "special", aria: "minus" },

  { label: "1", value: "1", kind: "number" },
  { label: "2", value: "2", kind: "number" },
  { label: "3", value: "3", kind: "number" },
  { label: "Ans", value: "Ans", kind: "special", aria: "previous answer" },
  { label: "=", action: "equals", kind: "high", aria: "Equals (Enter)", span: "big" },

  { label: "0", value: "0", kind: "number", span: "wide" },
  { label: ".", value: ".", kind: "number", aria: "decimal point" },
  { label: ",", value: ",", kind: "special", aria: "comma — separates nPr / nCr arguments" },
];

/**
 * @param {{ onClose?: () => void; onHelp: () => void; title?: string; headerEnd?: import("react").ReactNode }} props
 *  - onClose: omit for the full-screen standalone layout (no close button, Esc does nothing).
 *  - headerEnd: extra content before the help button (the standalone app puts its credit here).
 */
export function CalculatorPanel({ onClose, onHelp, title = "Calculator", headerEnd = null }) {
  const calc = useCalculator();
  const inputRef = useRef(null);

  // Focus the display when the widget opens (fine pointers only — a phone
  // keyboard popping up over the keypad is the opposite of helpful).
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  // Keep the caret in the display when tapping keys.
  const keepFocus = (e) => e.preventDefault();

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calc.calculate();
    } else if (e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      calc.clear();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      calc.backspace();
    } else if (e.key === "Escape" && onClose) {
      e.preventDefault();
      onClose();
    }
  };

  const onKey = (key) => {
    if ("action" in key) {
      if (key.action === "shift") calc.toggleShift();
      else if (key.action === "clear") calc.clear();
      else if (key.action === "backspace") calc.backspace();
      else calc.calculate();
      return;
    }
    calc.press(key.value, key.shift?.value);
  };

  return (
    <div className="calc-panel" role="dialog" aria-label="Scientific calculator" aria-modal="false">
      <header className="calc-header">
        <p className="calc-title">{title}</p>
        <div className="calc-header-right">
          {headerEnd}
          <button type="button" onClick={onHelp} className="calc-icon-btn" aria-label="How to use the calculator">
            <CircleHelp size={16} strokeWidth={2} />
          </button>
          {onClose ? (
            <button type="button" onClick={onClose} className="calc-icon-btn" aria-label="Close calculator">
              <X size={16} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="calc-screen">
        {/* Status strip — mode toggle lives where you look, like a real calculator */}
        <div className="calc-status">
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={calc.toggleAngleMode}
            className="calc-mode"
            aria-label={`Angle unit: ${calc.angleMode === "deg" ? "degrees" : "radians"}. Tap to switch.`}
            title="Switch between degrees and radians"
          >
            <span data-on={calc.angleMode === "deg" || undefined}>DEG</span>
            <span data-on={calc.angleMode === "rad" || undefined}>RAD</span>
          </button>
          <span className="calc-shift-tag" data-on={calc.shift || undefined} aria-live="polite">
            Shift
          </span>
          <span className="calc-ans" aria-live="polite">
            {calc.ans ? (
              <>
                Ans <strong>{calc.ans}</strong>
              </>
            ) : null}
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          className="calc-display"
          data-error={calc.isError || undefined}
          data-result={(calc.justEvaluated && !calc.isError) || undefined}
          value={calc.input}
          placeholder="0"
          aria-label="Expression"
          onChange={(e) => calc.type(e.target.value)}
          onKeyDown={onKeyDown}
        />

        {/* Surd results keep the root; the decimal value sits underneath. */}
        {calc.approx ? (
          <p className="calc-approx" aria-live="polite">
            ≈ {calc.approx}
          </p>
        ) : null}
      </div>

      <div className="calc-keypad" data-shift={calc.shift || undefined}>
        {KEYS.map((key) => {
          const isShiftKey = "action" in key && key.action === "shift";
          const hasShift = "shift" in key && !!key.shift;
          return (
            <button
              key={key.label}
              type="button"
              className="calc-key"
              data-kind={key.kind}
              data-span={key.span}
              data-has-shift={hasShift || undefined}
              data-on={(isShiftKey && calc.shift) || undefined}
              aria-pressed={isShiftKey ? calc.shift : undefined}
              aria-label={hasShift && calc.shift ? key.shift.aria ?? key.shift.label : key.aria}
              onMouseDown={keepFocus}
              onClick={() => onKey(key)}
            >
              {key.label === "⌫" ? (
                <Delete size="1.1em" strokeWidth={2} />
              ) : (
                <span className="calc-key-main">{key.label}</span>
              )}
              {hasShift ? <span className="calc-key-sub">{key.shift.label}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
