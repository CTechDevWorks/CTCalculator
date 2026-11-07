import { parse, format } from "mathjs";

/**
 * Exact surd arithmetic.
 *
 * Values are kept as a sum of terms  c·√r  where `c` is a rational (BigInt
 * fraction) and `r` is a square‑free positive integer (r = 1 for the rational
 * part). Every operation re‑normalises, so √500 becomes 10√5, √8 + √2 becomes
 * 3√2 and 1/√2 becomes √2/2 (denominators are always rationalised).
 *
 * Anything that cannot be represented exactly (π, trig, logs, nested
 * radicals that do not denest, huge numbers…) throws `NotExact`, and the
 * calculator falls back to math.js' normal decimal evaluation.
 */

export class NotExact extends Error {
  constructor(message = "not exact") {
    super(message);
    this.name = "NotExact";
  }
}

/* ───────────── Rationals ───────────── */

const abs = (x) => (x < 0n ? -x : x);

function gcd(a, b) {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Reduced rational n/d with d > 0. */
function rat(n, d = 1n) {
  if (d === 0n) throw new NotExact("division by zero");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

const ZERO = rat(0n);
const ONE = rat(1n);

const rAdd = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const rSub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const rMul = (a, b) => rat(a.n * b.n, a.d * b.d);
const rDiv = (a, b) => rat(a.n * b.d, a.d * b.n);
const rNeg = (a) => ({ n: -a.n, d: a.d });
const rIsZero = (a) => a.n === 0n;
const rIsInt = (a) => a.d === 1n;
const rSign = (a) => (a.n < 0n ? -1 : a.n > 0n ? 1 : 0);
const rToNumber = (a) => Number(a.n) / Number(a.d);

/** Keep BigInts from growing without bound (e.g. 7^900 then √ of that). */
const MAX_DIGITS = 400;
function guard(a) {
  if (abs(a.n).toString().length > MAX_DIGITS || a.d.toString().length > MAX_DIGITS) {
    throw new NotExact("number too large");
  }
  return a;
}

/** JS number → exact rational (finite decimals only; 1e21+ / 1e-7‑ bail). */
function fromNumber(x) {
  if (!Number.isFinite(x)) throw new NotExact("not finite");
  if (Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER) return rat(BigInt(x));
  const s = String(x);
  if (/e/i.test(s)) throw new NotExact("exponent notation");
  const neg = s.startsWith("-");
  const [int, frac = ""] = (neg ? s.slice(1) : s).split(".");
  const n = BigInt(int + frac) * (neg ? -1n : 1n);
  return rat(n, 10n ** BigInt(frac.length));
}

/* ───────────── Integer helpers ───────────── */

const MAX_FACTOR_TRIALS = 1_000_000; // trial division bound
const MAX_RADICAND = 2n ** 53n;

/** Integer square root or null. */
function isqrt(n) {
  if (n < 0n) return null;
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  // Correct float drift.
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x * x === n ? x : null;
}

/** Integer q‑th root or null. */
function iroot(n, q) {
  if (q === 1n) return n;
  if (n < 0n) return (q % 2n === 1n) ? (iroot(-n, q) === null ? null : -iroot(-n, q)) : null;
  if (n < 2n) return n;
  let x = BigInt(Math.round(Math.pow(Number(n), 1 / Number(q))));
  for (const c of [x - 1n, x, x + 1n]) {
    if (c >= 0n && c ** q === n) return c;
  }
  return null;
}

/** n = k² · s with s square‑free. Throws NotExact if n is too big to factor. */
function squareFree(n) {
  if (n < 0n) throw new NotExact("negative radicand");
  if (n < 2n) return { k: 1n, s: n };
  if (n > MAX_RADICAND) throw new NotExact("radicand too large");

  let m = Number(n);
  let k = 1;
  let s = 1;
  // 2 first, then odd divisors.
  while (m % 4 === 0) {
    k *= 2;
    m /= 4;
  }
  if (m % 2 === 0) {
    s *= 2;
    m /= 2;
  }
  for (let p = 3; p * p <= m && p <= MAX_FACTOR_TRIALS; p += 2) {
    if (m % p !== 0) continue;
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e += 1;
    }
    k *= p ** (e >> 1);
    if (e & 1) s *= p;
  }
  if (m > 1) {
    const root = Math.sqrt(m);
    if (Number.isInteger(root)) {
      k *= root; // leftover is a prime square
    } else if (m < MAX_FACTOR_TRIALS * MAX_FACTOR_TRIALS) {
      s *= m; // no factor ≤ √m → leftover is prime
    } else {
      throw new NotExact("cannot factor radicand");
    }
  }
  if (!Number.isSafeInteger(k) || !Number.isSafeInteger(s)) throw new NotExact("radicand too large");
  return { k: BigInt(k), s: BigInt(s) };
}

/* ───────────── Surd values ─────────────
 * A surd is an array of { c: rational, r: BigInt square‑free ≥ 1 } with distinct
 * radicands and no zero coefficients. [] is zero.
 */

function normalise(terms) {
  const map = new Map();
  for (const t of terms) {
    if (rIsZero(t.c)) continue;
    const key = t.r.toString();
    const prev = map.get(key);
    map.set(key, prev ? { c: rAdd(prev.c, t.c), r: t.r } : t);
  }
  return [...map.values()].filter((t) => !rIsZero(t.c)).map((t) => ({ c: guard(t.c), r: t.r }));
}

const sFromRat = (c) => normalise([{ c, r: 1n }]);
const sIsRational = (a) => a.every((t) => t.r === 1n);
const sRatPart = (a) => a.find((t) => t.r === 1n)?.c ?? ZERO;
const sIsZero = (a) => a.length === 0;
const sNeg = (a) => a.map((t) => ({ c: rNeg(t.c), r: t.r }));
const sAdd = (a, b) => normalise([...a, ...b]);
const sSub = (a, b) => sAdd(a, sNeg(b));

function sMul(a, b) {
  const out = [];
  for (const x of a) {
    for (const y of b) {
      const { k, s } = squareFree(x.r * y.r); // √r1·√r2 = k√s
      out.push({ c: rMul(rMul(x.c, y.c), rat(k)), r: s });
    }
  }
  return normalise(out);
}

/** As a rational — only valid when sIsRational(a). */
function sToRat(a) {
  if (!sIsRational(a)) throw new NotExact("not rational");
  return sRatPart(a);
}

/** Reciprocal with a rationalised denominator (conjugate method). */
function sInv(a) {
  if (sIsZero(a)) throw new NotExact("division by zero");
  let num = sFromRat(ONE);
  let den = a;
  for (let i = 0; i < 16; i += 1) {
    if (sIsRational(den)) {
      return sMul(num, sFromRat(rDiv(ONE, sToRat(den))));
    }
    // Flip the sign of the largest radical term: (A + t)(A − t) = A² − t², and
    // t² is rational, so each pass removes at least one radical.
    const t = den.filter((x) => x.r !== 1n).sort((p, q) => (p.r > q.r ? -1 : 1))[0];
    const conj = den.map((x) => (x === t ? { c: rNeg(x.c), r: x.r } : x));
    num = sMul(num, conj);
    den = sMul(den, conj);
    if (sIsZero(den)) throw new NotExact("division by zero");
  }
  throw new NotExact("could not rationalise");
}

const sDiv = (a, b) => sMul(a, sInv(b));

/** Square root of a rational ≥ 0: √(n/d) = √(n·d)/d. */
function sqrtRat(q) {
  if (rSign(q) < 0) throw new NotExact("negative radicand");
  if (rIsZero(q)) return [];
  const { k, s } = squareFree(q.n * q.d);
  return normalise([{ c: rat(k, q.d), r: s }]);
}

function sSqrt(a) {
  if (sIsRational(a)) return sqrtRat(sRatPart(a));

  // Denest √(p + q√r) = √x ± √y when p² − q²r is a perfect square.
  if (a.length === 2 && a.some((t) => t.r === 1n)) {
    const p = sRatPart(a);
    const radical = a.find((t) => t.r !== 1n);
    const q = radical.c;
    const r = rat(radical.r);
    if (sApprox(a) < 0) throw new NotExact("negative radicand");
    const disc = rSub(rMul(p, p), rMul(rMul(q, q), r)); // p² − q²r
    if (rSign(disc) >= 0) {
      const dn = isqrt(disc.n);
      const dd = isqrt(disc.d);
      if (dn !== null && dd !== null) {
        const root = rat(dn, dd);
        const x = rDiv(rAdd(p, root), rat(2n));
        const y = rDiv(rSub(p, root), rat(2n));
        if (rSign(x) >= 0 && rSign(y) >= 0) {
          const sx = sqrtRat(x);
          const sy = sqrtRat(y);
          return rSign(q) >= 0 ? sAdd(sx, sy) : sSub(sx, sy);
        }
      }
    }
  }
  throw new NotExact("nested radical");
}

function sCbrt(a) {
  const q = sToRat(a);
  const n = iroot(q.n, 3n);
  const d = iroot(q.d, 3n);
  if (n === null || d === null) throw new NotExact("not a perfect cube");
  return sFromRat(rat(n, d));
}

const MAX_SURD_EXP = 64n;
const MAX_RAT_EXP = 1024n;

function sPowInt(base, e) {
  // e: BigInt
  if (e < 0n) return sInv(sPowInt(base, -e));
  let result = sFromRat(ONE);
  let b = base;
  let n = e;
  while (n > 0n) {
    if (n & 1n) result = sMul(result, b);
    n >>= 1n;
    if (n > 0n) b = sMul(b, b);
  }
  return result;
}

function sPow(base, expo) {
  const e = sToRat(expo); // exponent must be rational
  if (sIsZero(base)) {
    if (rSign(e) < 0) throw new NotExact("division by zero");
    return rIsZero(e) ? sFromRat(ONE) : [];
  }
  if (rIsInt(e)) {
    const limit = sIsRational(base) ? MAX_RAT_EXP : MAX_SURD_EXP;
    if (abs(e.n) > limit) throw new NotExact("exponent too large");
    return sPowInt(base, e.n);
  }
  if (e.d === 2n) {
    // x^(p/2) = (√x)^p
    if (abs(e.n) > MAX_SURD_EXP) throw new NotExact("exponent too large");
    return sPowInt(sSqrt(base), e.n);
  }
  if (sIsRational(base) && e.d <= 12n) {
    // x^(p/q) exact only when x is a perfect q‑th power.
    const b = sRatPart(base);
    if (abs(e.n) > MAX_SURD_EXP) throw new NotExact("exponent too large");
    const n = iroot(b.n, e.d);
    const d = iroot(b.d, e.d);
    if (n === null || d === null) throw new NotExact("not a perfect power");
    return sPowInt(sFromRat(rat(n, d)), e.n);
  }
  throw new NotExact("irrational exponent");
}

function intArg(a, min, max, what) {
  const q = sToRat(a);
  if (!rIsInt(q) || q.n < BigInt(min) || q.n > BigInt(max)) throw new NotExact(`${what} needs a small whole number`);
  return q.n;
}

function factorial(n) {
  let f = 1n;
  for (let i = 2n; i <= n; i += 1n) f *= i;
  return f;
}

const MAX_FACT = 170;

function sFactorial(a) {
  return sFromRat(rat(factorial(intArg(a, 0, MAX_FACT, "factorial"))));
}

function sPermutations(n, k) {
  const N = intArg(n, 0, MAX_FACT, "nPr");
  const K = intArg(k, 0, MAX_FACT, "nPr");
  if (K > N) throw new NotExact("k > n");
  return sFromRat(rat(factorial(N) / factorial(N - K)));
}

function sCombinations(n, k) {
  const N = intArg(n, 0, MAX_FACT, "nCr");
  const K = intArg(k, 0, MAX_FACT, "nCr");
  if (K > N) throw new NotExact("k > n");
  return sFromRat(rat(factorial(N) / (factorial(K) * factorial(N - K))));
}

/** math.js mod: x − y·floor(x / y), rationals only. */
function sMod(a, b) {
  const x = sToRat(a);
  const y = sToRat(b);
  if (rIsZero(y)) throw new NotExact("mod by zero");
  const q = rDiv(x, y);
  let fl = q.n / q.d; // BigInt division truncates toward zero
  if (q.n < 0n && fl * q.d !== q.n) fl -= 1n;
  return sFromRat(rSub(x, rMul(y, rat(fl))));
}

function sApprox(a) {
  return a.reduce((sum, t) => sum + rToNumber(t.c) * Math.sqrt(Number(t.r)), 0);
}

/* ───────────── Display ───────────── */

function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}

/**
 * "10√5", "3√2 - 1", "√2/2", "(1 + √5)/2" — ASCII minus so the text can be
 * fed straight back in as Ans.
 */
function sToText(a) {
  const D = a.reduce((acc, t) => lcm(acc, t.c.d), 1n);
  const terms = [...a]
    .map((t) => ({ m: (t.c.n * D) / t.c.d, r: t.r }))
    // positive terms first (so "√2 - 1" rather than "-1 + √2"), then by radicand
    .sort((p, q) => (p.m < 0n) - (q.m < 0n) || (p.r < q.r ? -1 : p.r > q.r ? 1 : 0));

  let body = "";
  terms.forEach((t, i) => {
    const mag = abs(t.m);
    const coef = t.r === 1n ? mag.toString() : mag === 1n ? "" : mag.toString();
    const piece = `${coef}${t.r === 1n ? "" : `√${t.r}`}`;
    if (i === 0) body = (t.m < 0n ? "-" : "") + piece;
    else body += `${t.m < 0n ? " - " : " + "}${piece}`;
  });

  if (D === 1n) return body;
  return terms.length === 1 ? `${body}/${D}` : `(${body})/${D}`;
}

/* ───────────── AST evaluation ───────────── */

function evalNode(node) {
  switch (node.type) {
    case "ConstantNode": {
      if (typeof node.value !== "number") throw new NotExact("non‑numeric constant");
      return sFromRat(fromNumber(node.value));
    }
    case "ParenthesisNode":
      return evalNode(node.content);
    case "OperatorNode": {
      const args = node.args;
      switch (node.fn) {
        case "add":
          return sAdd(evalNode(args[0]), evalNode(args[1]));
        case "subtract":
          return sSub(evalNode(args[0]), evalNode(args[1]));
        case "multiply":
          return sMul(evalNode(args[0]), evalNode(args[1]));
        case "divide":
          return sDiv(evalNode(args[0]), evalNode(args[1]));
        case "pow":
          return sPow(evalNode(args[0]), evalNode(args[1]));
        case "unaryMinus":
          return sNeg(evalNode(args[0]));
        case "unaryPlus":
          return evalNode(args[0]);
        case "factorial":
          return sFactorial(evalNode(args[0]));
        case "mod":
          return sMod(evalNode(args[0]), evalNode(args[1]));
        default:
          throw new NotExact(`operator ${node.op}`);
      }
    }
    case "FunctionNode": {
      const name = node.fn?.name ?? node.name;
      const args = node.args.map(evalNode);
      switch (name) {
        case "sqrt":
          if (args.length !== 1) throw new NotExact("sqrt arity");
          return sSqrt(args[0]);
        case "cbrt":
          if (args.length !== 1) throw new NotExact("cbrt arity");
          return sCbrt(args[0]);
        case "abs":
          if (args.length !== 1) throw new NotExact("abs arity");
          return sApprox(args[0]) < 0 ? sNeg(args[0]) : args[0];
        case "square":
          return sMul(args[0], args[0]);
        case "cube":
          return sMul(sMul(args[0], args[0]), args[0]);
        case "pow":
          return sPow(args[0], args[1]);
        case "factorial":
          return sFactorial(args[0]);
        case "permutations":
          if (args.length !== 2) throw new NotExact("nPr arity");
          return sPermutations(args[0], args[1]);
        case "combinations":
          if (args.length !== 2) throw new NotExact("nCr arity");
          return sCombinations(args[0], args[1]);
        case "mod":
          return sMod(args[0], args[1]);
        default:
          throw new NotExact(`function ${name}`);
      }
    }
    default:
      // SymbolNode (pi, e, …) and anything else → decimal path.
      throw new NotExact(node.type);
  }
}

/**
 * Try to evaluate a math.js expression string exactly.
 *
 * Returns
 *   { surd: true,  text: "10√5", approx: "22.360679775" }  — result has a radical
 *   { surd: false, value: 6 }                               — result is rational
 *   null                                                    — not representable; use math.js
 */
export function evaluateExact(expression) {
  try {
    const value = evalNode(parse(expression));
    if (sIsRational(value)) {
      return { surd: false, value: rToNumber(sRatPart(value)) };
    }
    return {
      surd: true,
      text: sToText(value),
      approx: format(sApprox(value), { precision: 12 }),
    };
  } catch {
    // NotExact, parse errors, division by zero… all defer to math.js so error
    // messages stay identical to the live Kadet calculator.
    return null;
  }
}
