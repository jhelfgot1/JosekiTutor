import Intersection from "./Intersection";

class CheckMap {
  constructor() {
    this.checkMap = [];

    for (let i = 0; i <= 18; i++) {
      this.checkMap.push([]);
      for (let _ = 0; _ <= 18; _++) {
        this.checkMap[i].push(this.currentVacantToken);
      }
    }
  }

  clearCheckMap = () => {
    for (let i = 0; i <= 18; i++) {
      for (let j = 0; j <= 18; j++) {
        this.checkMap[i][j] = false;
      }
    }
  };

  needToCheck = intersection => {
    return !this.checkMap[intersection.x][intersection.y];
  };

  check = intersection => {
    this.checkMap[intersection.x][intersection.y] = true;
  };
}

export default CheckMap;
