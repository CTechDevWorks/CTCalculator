import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./Calcmodal.css";

function Calcmodal(props) {
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="calc-modal-title"
      centered
    >
      <Modal.Header>
        <Modal.Title id="calc-modal-title">
          Welcome to the CTCalculator App
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          CTCalculator is your all-in-one, ultra-slick, over-engineered scientific calculator built with React.js!
        </p>
        <ul>
          <li>➕ Basic arithmetic</li>
          <li>📐 Trigonometry — <code>sin()</code>, <code>cos()</code>, <code>tan()</code></li>
          <li>🧠 Smart constants — <code>pi()</code> for π</li>
          <li>🧮 Roots and powers — <code>sqrt()</code> for √</li>
        </ul>
        <p>⌨️ How to Use:</p>
        <ul>
          <li>🖱️ Click buttons on the screen, or...</li>
          <li>🎹 Use your keyboard for faster input</li>
          <li>⌫ Backspace deletes one character</li>
          <li>🧹 Shift + C clears the screen</li>
          <li>Press "=" or Enter key to evaluate</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>X</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Calcmodal;
