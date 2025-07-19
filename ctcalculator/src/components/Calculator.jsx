import React, { useState, useRef, useEffect } from "react";
import { evaluate } from "mathjs";
import "./Calculator.css";

const Calculator = () => {
  const [input, setInput] = useState("");
  const [ans, setAns] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const keepFocus = () => inputRef.current?.focus();

    // Focus once on mount
    keepFocus();

    // Re-focus whenever user clicks outside and returns
    window.addEventListener("click", keepFocus);

    return () => window.removeEventListener("click", keepFocus);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;

    if (justEvaluated) {
      // Get only the newly typed character
      const latestChar = newValue.slice(-1);
      setInput(latestChar); // Start fresh with only that character
      setJustEvaluated(false);
    } else {
      setInput(newValue); // Normal typing
    }
  };

  const handleBtnClick = (e) => {
    const value = e.target.value;
    if (justEvaluated) {
      setInput(value);
      setJustEvaluated(false);
    } else {
      setInput((prev) => prev + value);
    }
  };

  const formatInput = (text) => {
    return text
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt(")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/Ans/g, ans);
  };

  const calculate = () => {
    try {
      const format = formatInput(input);
      const result = evaluate(format);
      setInput(result.toString());
      setAns(result.toString());
      setJustEvaluated(true);
    } catch (err) {
      const message = `⚠️ Error: ${err.message}`;
      setInput(message);
      setJustEvaluated(true);
    }
  };

  const clear = () => {
    setInput("");
  };

  const backspace = () => {
    if (input.startsWith("⚠️ Error")) {
      setInput("");
    } else if (justEvaluated) {
      setInput("");
      setJustEvaluated(false);
    } else {
      setInput(input.slice(0, -1));
    }
  };

    const handleKeyDown = (e) => {
    if (e.key === "Enter"){
        calculate()
    } else if (e.altKey && e.key.toLowerCase() === "c") {
        clear()
    }
  }

  return (
    <div className="calculator">
      <input
        type="text"
        ref={inputRef}
        className="display"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      <div className="keypad">
        <div className="row">
          <button value="(" onClick={handleBtnClick} className="special">
            (
          </button>
          <button value=")" onClick={handleBtnClick} className="special">
            )
          </button>
          <button value="%" onClick={handleBtnClick} className="special">
            %
          </button>
          <button onClick={clear} className="high">
            C
          </button>
          <button onClick={backspace} className="high">
            ⌫
          </button>
        </div>

        <div className="row">
          <button value="sin(" onClick={handleBtnClick} className="special">
            sin
          </button>
          <button value="cos(" onClick={handleBtnClick} className="special">
            cos
          </button>
          <button value="tan(" onClick={handleBtnClick} className="special">
            tan
          </button>
          <button value="log(" onClick={handleBtnClick} className="special">
            log
          </button>
          <button value="π" onClick={handleBtnClick} className="special">
            π
          </button>
        </div>

        <div className="row">
          <button value="7" onClick={handleBtnClick} className="number">
            7
          </button>
          <button value="8" onClick={handleBtnClick} className="number">
            8
          </button>
          <button value="9" onClick={handleBtnClick} className="number">
            9
          </button>
          <button value="^" onClick={handleBtnClick} className="special">
            ^
          </button>
          <button value="√(" onClick={handleBtnClick} className="special">
            √
          </button>
        </div>

        <div className="row">
          <button value="4" onClick={handleBtnClick} className="number">
            4
          </button>
          <button value="5" onClick={handleBtnClick} className="number">
            5
          </button>
          <button value="6" onClick={handleBtnClick} className="number">
            6
          </button>
          <button value="×" onClick={handleBtnClick} className="special">
            ×
          </button>
          <button value="÷" onClick={handleBtnClick} className="special">
            ÷
          </button>
        </div>

        <div className="row">
          <button value="1" onClick={handleBtnClick} className="number">
            1
          </button>
          <button value="2" onClick={handleBtnClick} className="number">
            2
          </button>
          <button value="3" onClick={handleBtnClick} className="number">
            3
          </button>
          <button value="+" onClick={handleBtnClick} className="special">
            +
          </button>
          <button
            value="-"
            onClick={handleBtnClick}
            className="special"
            id="minus"
          >
            -
          </button>
        </div>

        <div className="row">
          <button value="0" onClick={handleBtnClick} className="number">
            0
          </button>
          <button value="." onClick={handleBtnClick} className="number">
            .
          </button>
          <button value="×10^" onClick={handleBtnClick} className="special">
            ×10^x
          </button>
          <button value="Ans" onClick={handleBtnClick} className="special">
            Ans
          </button>
          <button onClick={calculate} className="high">
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
