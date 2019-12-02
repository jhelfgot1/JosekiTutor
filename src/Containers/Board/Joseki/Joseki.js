import Intersection from "../Intersection";

class Joseki {
  constructor(priority, intersection) {
    this.position = intersection;
    this.responses = [];
    this.priority;
    this.explanation = "";
  }
}

export default Joseki;
