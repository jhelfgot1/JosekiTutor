import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Board from "./Containers/Board/Board";
function App() {
  return (
    <div className="App">
      <Board height="300" width="300" />
    </div>
  );
}

export default App;
