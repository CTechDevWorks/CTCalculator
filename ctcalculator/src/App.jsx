import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Calculator from "./components/Calculator";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  return (
    <>
      <Router>
        <Calculator />
      </Router>
    </>
  );
};

export default App;
