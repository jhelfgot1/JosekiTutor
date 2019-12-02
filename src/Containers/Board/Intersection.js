class Intersection {
  constructor(x, y) {
    if (x > 18 || x < 0) {
      console.error(
        "Intersection.js::constructor(x, y) Passed an invalid x coordinate to constructor: ",
        x
      );
      return;
    }

    if (y > 18 || y < 0) {
      console.error(
        "Intersection.js::constructor(x, y) Passed an invalid y coordinate to constructor: ",
        y
      );
      return;
    }

    this.x = x;
    this.y = y;
  }

  getAdjacents = () => {
    const adjacents = [];
    if (this.x > 0) {
      adjacents.push(new Intersection(this.x - 1, this.y));
    }

    if (this.y > 0) {
      adjacents.push(new Intersection(this.x, this.y - 1));
    }
    if (this.x < 18) {
      adjacents.push(new Intersection(this.x + 1, this.y));
    }
    if (this.y < 18) {
      adjacents.push(new Intersection(this.x, this.y + 1));
    }
    return adjacents;
  };

  equals = otherIntersection => {
    if (!otherIntersection instanceof Intersection) {
      console.error(
        "Intersection.js::equals(otherIntersection) Compared object not an intersection"
      );
      return false;
    }
    return this.x === otherIntersection.x && this.y === otherIntersection.y;
  };
}

export default Intersection;
