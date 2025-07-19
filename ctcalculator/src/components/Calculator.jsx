import React, { useState } from "react";
import { evaluate } from "mathjs";
import "./Calculator.css";

const Calculator = () => {
  const [input, setInput] = useState("");

  const handleClick = (e) => {
    setInput(e.target.value);
  };

  const handleBtnClick = (e) => {
    setInput(`${input + e.target.value}`);
  };

  const calculate = () => {
    try {
      const result = evaluate(input);
      setInput(result.toString());
    } catch (err) {
      const message = `⚠️ Error: ${err.message}`;
      setInput(message);
    }
  };

  return (
    <div className="calculator">
      <input
        type="text"
        className="display"
        value={input}
        onChange={handleClick}
      />

      <div className="keypad">
        <div className="row">
          <button value={"("} onClick={handleBtnClick} className="special">
            (
          </button>
          <button className="special">)</button>
          <button className="special">%</button>
          <button className="high">C</button>
          <button className="high">⌫</button>
        </div>

        <div className="row">
          <button className="special">sin</button>
          <button className="special">cos</button>
          <button className="special">tan</button>
          <button className="special">log</button>
          <button className="special">π</button>
        </div>

        <div className="row">
          <button className="number">7</button>
          <button className="number">8</button>
          <button className="number">9</button>
          <button className="special">^</button>
          <button className="special">√</button>
        </div>

        <div className="row">
          <button className="number">4</button>
          <button className="number">5</button>
          <button className="number">6</button>
          <button className="special">*</button>
          <button className="special">/</button>
        </div>

        <div className="row">
          <button className="number">1</button>
          <button className="number">2</button>
          <button className="number">3</button>
          <button className="special">+</button>
          <button className="special" id="minus">
            -
          </button>
        </div>

        <div className="row">
          <button className="number">0</button>
          <button className="number">.</button>
          <button className="special">×10^x</button>
          <button className="special">Ans</button>
          <button onClick={calculate} className="high">
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
