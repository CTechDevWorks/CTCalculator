import { useCallback, useMemo, useState } from "react";
import { evaluate, format } from "mathjs";
import { evaluateExact } from "./surds";

/**
 * Scientific calculator state.
 *
 * Same engine as the Kadet AI calculator — a one‑shot Shift layer
 * (sin⁻¹ cos⁻¹ tan⁻¹ 10ˣ eˣ), a DEG/RAD angle mode, and extra keys (ln, e,
 * n!, nPr, nCr, ∛, comma). Expressions are kept in human notation in the
 * display and translated to math.js syntax only at evaluation time.
 *
 * CTCalculator extra: results are first tried exactly (see surds.js) so
 * √(500) → 10√5, √(8)+√(2) → 3√2 and 1÷√(2) → √2/2. Anything that isn't a
 * clean surd falls back to the usual decimal answer.
 */

export const ERROR_PREFIX = "⚠️ Error";

/** Tokens that continue from the previous answer instead of replacing it. */
const CONTINUE_OPERATORS = new Set(["+", "-", "×", "÷", "^", "%", ")", "×10^", "!", ","]);

const D2R = Math.PI / 180;
/** Snap float noise (sin 180° = 1.2e‑16) to exact values like a real calculator. */
const clean = (v) => (Math.abs(v) < 1e-13 ? 0 : Math.abs(Math.abs(v) - 1) < 1e-13 ? Math.sign(v) : v);

/** Degree‑mode trig — injected into math.js via the evaluation scope. */
const DEGREE_SCOPE = {
  sinD: (x) => clean(Math.sin(x * D2R)),
  cosD: (x) => clean(Math.cos(x * D2R)),
  tanD: (x) => clean(Math.tan(x * D2R)),
  asinD: (x) => Math.asin(x) / D2R,
  acosD: (x) => Math.acos(x) / D2R,
  atanD: (x) => Math.atan(x) / D2R,
};

/** Human keypad tokens → math.js syntax. */
function toMathjs(text, ans, mode) {
  // A surd answer like "3√2 - 1" or "√2/2" has to be bracketed before it is
  // dropped into a bigger expression.
  const ansValue = ans === "" ? "0" : /[-+/ √]/.test(ans) ? `(${ans})` : ans;
  const deg = mode === "deg";
  return (
    text
      .replace(/π/g, "pi")
      // Inverse trig first so the plain‑trig pass below can't double‑match.
      .replace(/sin⁻¹\(/g, deg ? "asinD(" : "asin(")
      .replace(/cos⁻¹\(/g, deg ? "acosD(" : "acos(")
      .replace(/tan⁻¹\(/g, deg ? "atanD(" : "atan(")
      .replace(/\b(sin|cos|tan)\(/g, deg ? "$1D(" : "$1(")
      .replace(/Ans/g, ansValue)
      // "√5" (as printed in a surd answer) → sqrt(5); "√(" stays a call.
      .replace(/√(\d+(?:\.\d+)?)/g, "sqrt($1)")
      .replace(/√/g, "sqrt")
      .replace(/∛/g, "cbrt")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\blog\(/g, "log10(") // scientific‑calculator log = base 10
      .replace(/\bln\(/g, "log(") // math.js natural log
      .replace(/\bnPr\(/g, "permutations(")
      .replace(/\bnCr\(/g, "combinations(")
  );
}

/**
 * A surd answer continued with an operator must be bracketed first, otherwise
 * "12√5" + "^2" would square only the √5. Plain decimals stay as they are.
 */
const continueFrom = (answer) => (answer.includes("√") ? `(${answer})` : answer);

function toDisplay(result) {
  const value = typeof result === "number" ? clean(result) : result;
  return format(value, { precision: 14 });
}

export function useCalculator() {
  const [input, setInput] = useState("");
  const [ans, setAns] = useState("");
  /** Decimal value of a surd result — shown under the display as "≈ …". */
  const [approx, setApprox] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [shift, setShift] = useState(false);
  const [angleMode, setAngleMode] = useState("deg");

  const isError = input.startsWith(ERROR_PREFIX);

  const insert = useCallback(
    (value) => {
      setApprox("");
      if (justEvaluated) {
        setJustEvaluated(false);
        if (!isError && CONTINUE_OPERATORS.has(value)) {
          setInput((prev) => continueFrom(prev) + value); // 12 = → "+ 3" keeps working on the answer
        } else {
          setInput(value);
        }
        return;
      }
      setInput((prev) => prev + value);
    },
    [justEvaluated, isError],
  );

  /** Keypad button. Uses the key's shift token when Shift is armed, then releases Shift. */
  const press = useCallback(
    (value, shiftValue) => {
      insert(shift && shiftValue ? shiftValue : value);
      if (shift) setShift(false);
    },
    [insert, shift],
  );

  /** Raw keyboard typing into the display. */
  const type = useCallback(
    (nextValue) => {
      setApprox("");
      if (justEvaluated) {
        setJustEvaluated(false);
        // The field held the previous answer; keep only what was just typed.
        const typed = nextValue.startsWith(input) ? nextValue.slice(input.length) : nextValue;
        const continues = !isError && /^[*/+\-^%)×÷!,]$/.test(typed);
        setInput(continues ? continueFrom(input) + typed : typed);
        return;
      }
      setInput(nextValue);
    },
    [justEvaluated, input, isError],
  );

  const calculate = useCallback(() => {
    if (!input.trim() || isError) return;
    try {
      const expression = toMathjs(input, ans, angleMode);

      // 1. Exact pass — keeps square roots as surds and rationalises denominators.
      const exact = evaluateExact(expression);
      if (exact?.surd) {
        setInput(exact.text);
        setAns(exact.text);
        setApprox(exact.approx);
      } else {
        // 2. Decimal pass — identical to the live Kadet calculator.
        const result = exact ? exact.value : evaluate(expression, { ...DEGREE_SCOPE });
        if (typeof result === "function" || result === undefined) {
          throw new Error("Incomplete expression");
        }
        const text = toDisplay(result);
        setInput(text);
        setAns(text);
        setApprox("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid expression";
      setInput(`${ERROR_PREFIX}: ${message}`);
      setApprox("");
    }
    setJustEvaluated(true);
    setShift(false);
  }, [input, ans, angleMode, isError]);

  const clear = useCallback(() => {
    setInput("");
    setApprox("");
    setJustEvaluated(false);
    setShift(false);
  }, []);

  const backspace = useCallback(() => {
    setApprox("");
    if (isError || justEvaluated) {
      setInput("");
      setJustEvaluated(false);
      return;
    }
    setInput((prev) => prev.slice(0, -1));
  }, [isError, justEvaluated]);

  const toggleShift = useCallback(() => setShift((v) => !v), []);
  const toggleAngleMode = useCallback(() => setAngleMode((m) => (m === "deg" ? "rad" : "deg")), []);

  return useMemo(
    () => ({
      input,
      ans,
      approx,
      isError,
      justEvaluated,
      shift,
      angleMode,
      press,
      type,
      calculate,
      clear,
      backspace,
      toggleShift,
      toggleAngleMode,
    }),
    [input, ans, approx, isError, justEvaluated, shift, angleMode, press, type, calculate, clear, backspace, toggleShift, toggleAngleMode],
  );
}
