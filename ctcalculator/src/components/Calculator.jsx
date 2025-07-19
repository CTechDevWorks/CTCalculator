import React from "react";
import "./Calculator.css";

const Calculator = () => {
  return (
    <div className="calculator">
        <input type="text" className="display" readOnly />
      <div className="keypad">
        <div className="row">
          <button className="special">sin</button>
          <button className="special">cos</button>
          <button className="special">tan</button>
          <button className="special">log</button>
        </div>

        <div className="row">
          <button className="high">C</button>
          <button className="high">⌫</button>
          <button className="special">/</button>
          <button className="special">*</button>
        </div>

        <div className="row">
          <button className="number">7</button>
          <button className="number">8</button>
          <button className="number">9</button>
          <button className="special">-</button>
        </div>

        <div className="row">
          <button className="number">4</button>
          <button className="number">5</button>
          <button className="number">6</button>
          <button className="special">+</button>
        </div>

        <div className="row">
          <button className="number">1</button>
          <button className="number">2</button>
          <button className="number">3</button>
          <button className="high">=</button>
        </div>

        <div className="row">
          <button className="number">0</button>
          <button className="number">.</button>
          <button className="special">^</button>
          <button className="special">√</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
