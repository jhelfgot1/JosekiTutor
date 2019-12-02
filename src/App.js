import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Board from "./Containers/Board/Board";
import ControlPanel from "./Containers/ControlPanel/ControlPanel";
function App() {
  return (
    <div className="App">
      <Board />

      <ControlPanel />
    </div>
  );
}

export default App;
