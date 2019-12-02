import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./Board.css";
import backgroundImage from "./woodgrain.jpg";
import Intersection from "./Intersection";
import CheckMap from "./CheckMap";

class Board extends Component {
  state = {};

  colors = {
    white: "#ffffff",
    black: "#000000"
  };

  players = {
    NONE: 0,
    WHITE: 1,
    BLACK: 2
  };

  constructor(props) {
    super(props);
    this.stones = [];
    this.whiteStones = [];
    this.blackStones = [];
    this.checkMap = new CheckMap();

    this.hoveredStone = null;
    this.canvas = null;
    this.currentPlayer = this.players.BLACK;
    this.ctx = null;
    this.img = null;
    this.containingDiv = null;

    this.canvasRef = React.createRef();
    this.backgroundImageRef = React.createRef();
    this.containingDivRef = React.createRef();

    this.gridOffset = 1 / 20;

    for (let i = 0; i <= 18; i++) {
      this.stones.push([]);
      for (let j = 0; j <= 18; j++) {
        this.stones[i].push(this.players.NONE);
      }
    }
  }

  drawInitialBoard = () => {
    const drawGrid = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.canvas.width * this.gridOffset,
        this.canvas.height * this.gridOffset,
        (1 - this.gridOffset * 2) * this.canvas.width,
        (1 - this.gridOffset * 2) * this.canvas.height
      );

      const xOffset = this.gridOffset * this.canvas.width;
      const yOffset = this.gridOffset * this.canvas.height;
      const gridSide = this.canvas.width * (1 - 2 * this.gridOffset);

      this.ctx.lineWidth = 2;
      for (let i = 1; i <= 17; i++) {
        let increment = i * gridSide * (1 / 18);
        this.ctx.moveTo(Math.round(xOffset + increment), Math.round(yOffset));
        this.ctx.lineTo(
          Math.round(xOffset + increment),
          Math.round(this.canvas.height - yOffset)
        );
        this.ctx.stroke();

        this.ctx.moveTo(Math.round(xOffset), Math.round(yOffset + increment));
        this.ctx.lineTo(
          Math.round(this.canvas.width - xOffset),
          Math.round(yOffset + increment)
        );
        this.ctx.stroke();
      }

      this.ctx.stroke();
    };
    if (this.canvas && this.ctx && this.img) {
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.ctx.drawImage(
        this.img,
        0,
        0,
        this.img.width,
        this.img.height,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      drawGrid();
      this.ctx.save();
    }
  };

  reDrawCanvas = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawInitialBoard();
    this.drawStones();
    this.hoveredStone = null;
  };

  drawStones = () => {
    this.whiteStones.map(intersection => {
      this.drawStone(intersection, this.colors.white);
    });
    this.blackStones.map(intersection => {
      this.drawStone(intersection, this.colors.black);
    });
    if (this.hoveredStone) {
      this.drawHoveredStone(this.hoveredStone, this.currentPlayer);
    }
  };

  drawStone = (intersection, color) => {
    let { x, y } = this.intersectionToCanvasCoords(intersection);
    const radius =
      (this.canvas.width - 2 * this.gridOffset * this.canvas.width) / (18 * 2);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  };

  drawHoveredStone = (intersection, player) => {
    if (this.stones[intersection.x][intersection.y] !== this.players.NONE) {
      return;
    }

    let { x, y } = this.intersectionToCanvasCoords(intersection);
    const radius =
      (this.canvas.width - 2 * this.gridOffset * this.canvas.width) / (18 * 2);

    const color =
      this.currentPlayer == this.players.BLACK
        ? "rgba(0, 0, 0, 0.5)"
        : "rgba(255, 255, 255, 0.5)";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  };

  placeStone = intersection => {
    if (this.isValidMove(intersection)) {
      this.stones[intersection.x][intersection.y] = this.currentPlayer;
      this.captureStones(intersection);

      if (this.currentPlayer == this.players.BLACK) {
        this.blackStones.push(intersection);
      } else {
        this.whiteStones.push(intersection);
      }
      this.reDrawCanvas();
      return true;
    }

    return false;
  };

  captureStones = intersection => {
    this.checkMap.clearCheckMap();

    const enemyColor =
      this.stones[intersection.x][intersection.y] == this.players.BLACK
        ? this.players.WHITE
        : this.players.BLACK;

    const adjacentEnemies = intersection.getAdjacents().filter(int => {
      return this.stones[int.x][int.y] == enemyColor;
    });

    adjacentEnemies.map(enemy => {
      let libertyFound = false;
      if (!this.checkMap.needToCheck(enemy)) {
        return;
      }
      const adjacentEnemyQ = [enemy];
      const stonesToRemove = [];
      while (adjacentEnemyQ.length > 0) {
        const currentEnemy = adjacentEnemyQ.pop(0);
        if (!this.checkMap.needToCheck(currentEnemy)) {
          continue;
        }
        this.checkMap.check(currentEnemy);

        const adjacentIntersections = currentEnemy.getAdjacents();

        for (let i = 0; i < adjacentIntersections.length; i++) {
          const currAdjInt = adjacentIntersections[i];
          if (this.stones[currAdjInt.x][currAdjInt.y] == this.players.NONE) {
            libertyFound = true;
            break;
          }
          if (this.stones[currAdjInt.x][currAdjInt.y] == enemyColor) {
            adjacentEnemyQ.push(currAdjInt);
          }
        }
        this.checkMap.check(currentEnemy);
        if (libertyFound) {
          break;
        }

        stonesToRemove.push(currentEnemy);
      }

      if (!libertyFound) {
        stonesToRemove.map(stone => {
          this.stones[stone.x][stone.y] = this.players.NONE;
        });
        this.removeStonesFromPlayer(enemyColor);
      }
    });
  };

  endTurn = () => {
    this.currentPlayer =
      this.currentPlayer == this.players.BLACK
        ? this.players.WHITE
        : this.players.BLACK;
  };

  setCanvasDimensions = () => {
    const newWidth = Math.min(
      this.containingDiv.offsetWidth,
      0.8 * window.innerHeight
    );

    this.setState({
      divDimensions: { width: newWidth, height: newWidth }
    });
  };

  calcCanvasOffset = (xPage, yPage) => {
    let boundingCoords = this.canvas.getBoundingClientRect();

    return {
      x: xPage - boundingCoords.left,
      y: yPage - boundingCoords.top
    };
  };

  componentDidMount() {
    if (!this.img) {
      this.img = this.backgroundImageRef.current;
    }

    if (!this.canvas) {
      this.canvas = this.canvasRef.current;
      this.ctx = this.canvas.getContext("2d");
    }

    if (!this.containingDiv) {
      this.containingDiv = this.containingDivRef.current;
    }

    this.img.onload = () => {
      this.drawInitialBoard();
    };
  }

  componentWillMount() {
    this.setState({
      divDimensions: {
        width: 0.8 * window.innerHeight,
        height: 0.8 * window.innerHeight
      }
    });
  }

  canvasMoved = evt => {
    this.hoveredStone = this.getIntersection(
      this.calcCanvasOffset(evt.pageX, evt.pageY)
    );
    this.reDrawCanvas();
  };

  canvasClicked = evt => {
    const intersection = this.getIntersection(
      this.calcCanvasOffset(evt.pageX, evt.pageY)
    );

    if (this.placeStone(intersection)) {
      this.endTurn();
    }
  };

  removeStonesFromPlayer = player => {
    if (player === this.players.BLACK) {
      this.blackStones = this.blackStones.filter(stone => {
        return this.stones[stone.x][stone.y] !== this.players.NONE;
      });
    } else {
      this.whiteStones = this.whiteStones.filter(stone => {
        return this.stones[stone.x][stone.y] !== this.players.NONE;
      });
    }
  };

  isValidMove = intersection => {
    if (this.moveIsIllegalKo(intersection)) {
      return false;
    }

    if (this.stones[intersection.x][intersection.y] !== this.players.NONE) {
      return false;
    }

    if (this.willRemoveEnemyStones(intersection)) {
      return true;
    }

    if (this.isSuicidal(intersection)) {
      return false;
    }

    return true;
  };

  moveIsIllegalKo = initialIntersection => {
    //ToDo:: Establish Ko logic.

    return false;
  };

  willRemoveEnemyStones = initialIntersection => {
    //Clear check map
    this.checkMap.clearCheckMap();

    //Get the color of the enemy

    const enemyColor =
      this.currentPlayer === this.players.BLACK
        ? this.players.WHITE
        : this.players.BLACK;

    //Get all stones adjacent to placed stone that are enemies.

    const adjacentEnemyStones = initialIntersection
      .getAdjacents()
      .filter(intersection => {
        return this.stones[intersection.x][intersection.y] === enemyColor;
      });
    //For each enemy stone, check if that stone is now completely surrounded by the attacking player.
    for (let i = 0; i < adjacentEnemyStones.length; i++) {
      let libertyFound = false;

      const currentAdjacentEnemy = adjacentEnemyStones[i];
      if (!this.checkMap.needToCheck(currentAdjacentEnemy)) {
        continue;
      }
      const intersectionQueue = [currentAdjacentEnemy];

      while (intersectionQueue.length > 0) {
        const currentIntersection = intersectionQueue.pop(0);
        if (!this.checkMap.needToCheck(currentIntersection)) {
          continue;
        }
        this.checkMap.check(currentIntersection);

        const adjacentIntersections = currentIntersection.getAdjacents();

        for (let j = 0; j < adjacentIntersections.length; j++) {
          const currentAdjacentIntersection = adjacentIntersections[j];

          if (currentAdjacentIntersection.equals(initialIntersection)) {
            continue;
          }

          if (
            this.stones[currentAdjacentIntersection.x][
              currentAdjacentIntersection.y
            ] == this.players.NONE
          ) {
            libertyFound = true;
            break;
          }

          if (
            this.stones[currentAdjacentIntersection.x][
              currentAdjacentIntersection.y
            ] == enemyColor
          ) {
            intersectionQueue.push(currentAdjacentIntersection);
          }
        }

        if (libertyFound) {
          break;
        }
      }

      if (!libertyFound) {
        return true;
      }
    }
    return false;
  };

  isSuicidal = intersection => {
    return !this.stonePlacementHasLiberty(intersection);
  };

  stonePlacementHasLiberty = initialIntersection => {
    this.checkMap.clearCheckMap();
    const intersectionQueue = [initialIntersection];
    this.checkMap.check(initialIntersection);
    while (intersectionQueue.length > 0) {
      const currentIntersection = intersectionQueue.pop();

      //Check if the current location is a free space, or a liberty.
      //Bypass for the first intersection passed to the function because that
      //will always be empty.

      if (!currentIntersection.equals(initialIntersection)) {
        if (
          this.stones[currentIntersection.x][currentIntersection.y] ==
          this.players.NONE
        ) {
          return true;
        }
      }

      intersectionQueue.push(
        ...currentIntersection.getAdjacents().filter(intersection => {
          if (
            this.stones[intersection.x][intersection.y] !== this.players.NONE &&
            this.stones[intersection.x][intersection.y] !== this.currentPlayer
          ) {
            return false;
          }
          if (this.checkMap.needToCheck(intersection)) {
            this.checkMap.check(intersection);
            return true;
          }
          return false;
        })
      );
    }

    return false;
  };

  intersectionToCanvasCoords = intersection => {
    const incrementDistance =
      (this.canvas.width - 2 * this.gridOffset * this.canvas.width) / 18;
    return {
      x:
        intersection.x * incrementDistance +
        this.gridOffset * this.canvas.width,
      y:
        intersection.y * incrementDistance +
        this.gridOffset * this.canvas.height
    };
  };

  getIntersection = coords => {
    let x = Math.round(
      (Math.min(
        this.canvas.width - 2 * this.gridOffset * this.canvas.width,
        Math.max(0, coords.x - this.gridOffset * this.canvas.width)
      ) /
        (this.canvas.width - 2 * this.gridOffset * this.canvas.width)) *
        18
    );
    let y = Math.round(
      (Math.min(
        this.canvas.height - 2 * this.gridOffset * this.canvas.height,
        Math.max(0, coords.y - this.gridOffset * this.canvas.height)
      ) /
        (this.canvas.height - 2 * this.gridOffset * this.canvas.height)) *
        18
    );
    return new Intersection(x, y);
  };

  render() {
    const hiddenStyle = {
      display: "none"
    };
    return (
      <div className="Board" ref={this.containingDivRef}>
        <canvas
          onClick={evt => this.canvasClicked(evt)}
          ref={this.canvasRef}
          onMouseMove={evt => this.canvasMoved(evt)}
        />
        <img
          ref={this.backgroundImageRef}
          src={backgroundImage}
          style={hiddenStyle}
        />
      </div>
    );
  }
}

export default Board;
