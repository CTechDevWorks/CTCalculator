import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function CalcModal(props) {
  return (
    <Modal
      {...props}
      size="md" // Reduced width
      aria-labelledby="calc-modal-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="calc-modal-title">
          Welcome to My Calculator App
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          This is a powerful scientific calculator built with React. You can use it to perform a wide range of calculations including basic arithmetic, trigonometric functions (like sin, cos, tan), powers, roots, and more.
        </p>
        <p>
          To use it, simply click the on-screen buttons or use your keyboard. You can use functions like:
          <ul>
            <li><strong>π</strong> for pi</li>
            <li><strong>√</strong> for square root</li>
            <li><strong>Ans</strong> to use the last answer</li>
            <li><strong>Backspace</strong> to delete a character</li>
            <li><strong>Clear</strong> to reset the input</li>
          </ul>
          Press the "=" button or Enter key to evaluate your expression.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function App() {


  return (
    <>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        Show Calculator Info
      </Button>

      <CalcModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default App;
