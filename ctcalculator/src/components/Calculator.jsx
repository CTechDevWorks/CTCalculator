import React from "react";
import "./Calculator.css";

const Calculator = () => {
  return (
    <div className="calculator">
      <input type="text" className="display" readOnly />

      <div className="keypad">
        {/* Row 1: Brackets, percent, constants */}
        <div className="row">
          <button className="special">[</button>
          <button className="special">]</button>
          <button className="special">%</button>
          <button className="special">π</button>
          <button className="special">×10^x</button>
        </div>

        {/* Row 2: Trig + log + power */}
        <div className="row">
          <button className="special">sin</button>
          <button className="special">cos</button>
          <button className="special">tan</button>
          <button className="special">log</button>
          <button className="special">^</button>
        </div>

        {/* Row 3: Controls and core ops */}
        <div className="row">
          <button className="high">C</button>
          <button className="high">⌫</button>
          <button className="special">/</button>
          <button className="special">*</button>
          <button className="special minus">-</button>
        </div>

        {/* Row 4: Top digits + +, Ans */}
        <div className="row">
          <button className="number">7</button>
          <button className="number">8</button>
          <button className="number">9</button>
          <button className="special">+</button>
          <button className="special">Ans</button>
        </div>

        {/* Row 5: Mid digits + root + equals */}
        <div className="row">
          <button className="number">4</button>
          <button className="number">5</button>
          <button className="number">6</button>
          <button className="special">√</button>
          <button className="high">=</button>
        </div>

        {/* Row 6: Bottom digits */}
        <div className="row">
          <button className="number">0</button>
          <button className="number">1</button>
          <button className="number">2</button>
          <button className="number">3</button>
          <button className="number">.</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
