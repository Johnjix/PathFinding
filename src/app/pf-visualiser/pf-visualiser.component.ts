import { Component, OnInit } from "@angular/core";
import { cellState, cellNeighbors } from "./cellState";

@Component({
  selector: "app-pf-visualiser",
  templateUrl: "./pf-visualiser.component.html",
  styleUrls: ["./pf-visualiser.component.css"],
})
export class PfVisualiserComponent implements OnInit {
  gridRow: any;
  gridCol: any;
  maxCellID: number;
  CELLS: cellState[] = [];
  cellIdStr: string[] = [];
  exploreOrder: number[] = [];
  foundTarget: boolean;
  //cell start coord-15-11
  //cell end coord-35-11
  startingCell: number[] = [15, 11];
  endingCell: number[] = [20, 11];
  startingCellOneD: number;
  endingCellOneD: number;

  constructor() {}

  ngOnInit() {
    // Initialise Grid
    this.gridRow = Array.from(Array(25)).map((x, i) => i);
    this.gridCol = Array.from(Array(50)).map((y, j) => j);

    // Initialise Grid Properties
    this.foundTarget = false;
    this.createCellID(this.gridRow.length, this.gridCol.length);
    console.log("Row", this.gridRow.length);
    console.log("Col", this.gridCol.length);
    this.maxCellID = this.gridRow.length * this.gridCol.length - 1;
    console.log("Maximum Cell ID", this.maxCellID);

    // Populate CELLS Object
    this.assignProp();

    // Set Start and End Nodes
    this.setStartEnd(
      this.startingCell[0],
      this.startingCell[1],
      this.endingCell[0],
      this.endingCell[1]
    );
  }

  // Function to Initialise Grid Properties
  createCellID(Row, Col) {
    var rowStr: string;
    var colStr: string;
    var a: string = "coord-";
    var b: string = "-";
    var c: string;
    for (let j = 0; j < Row; j++) {
      for (let i = 0; i < Col; i++) {
        c = a.concat(i.toString(), b, j.toString());
        this.cellIdStr.push(c);
      }
    }
  }

  setStartEnd(startx, starty, endx, endy) {
    var start: number = startx + 50 * starty;
    var end: number = endx + 50 * endy;
    this.CELLS[start].start = true;
    this.CELLS[start].distanceFromStart = 0;
    this.CELLS[end].end = true;

    // For Shortest Path Tracing
    this.startingCellOneD = start;
    this.endingCellOneD = end;
  }
  setvisited(cell) {
    this.CELLS[cell].visited = true;
  }

  // Function to Populate CELLS Object
  assignProp() {
    for (let i = 0; i < this.cellIdStr.length; i++) {
      this.CELLS[i] = {
        cellId: i,
        xCoord: i % this.gridCol.length,
        yCoord: Math.floor(i / this.gridCol.length),
        cellIdstr: this.cellIdStr[i],
        start: false,
        end: false,
        visited: false,
        path: false,
        distanceFromStart: Infinity,
        previousCell: null,
      };
    }
  }

  // Dijsktra Algorithm
  dijkstra() {
    var unExplored = this.CELLS.filter((visited) => visited.visited == false);
    var explored = [];
    var neighbors: cellNeighbors[] = [];
    var topNeighborCoord: cellNeighbors;
    var bottomNeighborCoord: cellNeighbors;
    var rightNeighborCoord: cellNeighbors;
    var leftNeighborCoord: cellNeighbors;

    // Shortest Path Variables
    var tracingShortestPath = true;
    var shortestPath = [];
    while (unExplored.length != 0 && this.foundTarget == false) {
      // Sort unExplored Cells ascending order by distance to start
      unExplored.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

      // Set 1st Cell to Visted
      this.CELLS[unExplored[0].cellId].visited = true;
      this.exploreOrder.push(unExplored[0].cellId);

      // Set neighbor Cells distance to 1
      // Top Neighbor
      if (this.yCoordCalc(unExplored[0].yCoord, "lower") == null) {
      } else {
        topNeighborCoord = this.findTopNeighbor(unExplored[0]);
        // this.exploreOrder.push(topNeighborCoord.cellId);
        this.CELLS[topNeighborCoord.cellId].previousCell = unExplored[0].cellId;
        this.CELLS[topNeighborCoord.cellId].distanceFromStart =
          unExplored[0].distanceFromStart + 1;
      }
      // Bottom Neighbor
      if (this.yCoordCalc(unExplored[0].yCoord, "upper") == null) {
      } else {
        bottomNeighborCoord = this.findBottomNeighbor(unExplored[0]);
        // this.exploreOrder.push(bottomNeighborCoord.cellId);
        this.CELLS[bottomNeighborCoord.cellId].previousCell =
          unExplored[0].cellId;
        this.CELLS[bottomNeighborCoord.cellId].distanceFromStart =
          unExplored[0].distanceFromStart + 1;
      }
      // Right Neighbor
      if (this.xCoordCalc(unExplored[0].xCoord, "upper") == null) {
      } else {
        rightNeighborCoord = this.findRightNeighbor(unExplored[0]);
        // this.exploreOrder.push(rightNeighborCoord.cellId);
        this.CELLS[rightNeighborCoord.cellId].previousCell =
          unExplored[0].cellId;
        this.CELLS[rightNeighborCoord.cellId].distanceFromStart =
          unExplored[0].distanceFromStart + 1;
      }
      // Left Neighbor
      if (this.xCoordCalc(unExplored[0].xCoord, "lower") == null) {
      } else {
        leftNeighborCoord = this.findLeftNeighbor(unExplored[0]);
        // this.exploreOrder.push(leftNeighborCoord.cellId);
        this.CELLS[leftNeighborCoord.cellId].previousCell =
          unExplored[0].cellId;
        this.CELLS[leftNeighborCoord.cellId].distanceFromStart =
          unExplored[0].distanceFromStart + 1;
      }

      if (unExplored[0].end == true) {
        // If end cell reached, end loop
        this.foundTarget = true;
      }
      unExplored = this.CELLS.filter((visited) => visited.visited == false);
    }

    // console.log(unExplored);

    // CALCULATE SHORTEST PATH BY TRACING PREVIOUSCELL
    shortestPath.push(this.CELLS[this.endingCellOneD].cellId);

    // while (tracingShortestPath) {
    //   var prevC: number = this.CELLS[this.endingCellOneD].previousCell;
    //   var currentC: number;
    //   for (let i = 0; i < this.maxCellID; i++) {
    //     if ((this.CELLS[i].cellId = prevC)) {
    //       currentC = this.CELLS[i].previousCell;
    //       shortestPath.push(this.CELLS[i].cellId);
    //       prevC = this.CELLS[i].cellId;
    //     }
    //   }
    //   if (this.CELLS[shortestPath[shortestPath.length - 1]].start == true) {
    //     tracingShortestPath = false;
    //   }
    // }
    // console.log("Shortest Path", shortestPath);
    console.log("ending cell", this.endingCellOneD);
    this.CELLS[this.endingCellOneD].path = true;
    this.CELLS[568].path = true;
    console.log(this.CELLS[568]);
  }

  // Top Neighbor
  findTopNeighbor(cell: cellState) {
    let neighbor: cellNeighbors = {
      xCoord: cell.xCoord,
      yCoord: this.yCoordCalc(cell.yCoord, "lower"),
      cellId: this.topNeighbor(cell),
    };
    return neighbor;
  }
  // Bottom Neighbor
  findBottomNeighbor(cell: cellState) {
    let neighbor: cellNeighbors = {
      xCoord: cell.xCoord,
      yCoord: this.yCoordCalc(cell.yCoord, "upper"),
      cellId: this.botNeighbor(cell),
    };
    return neighbor;
  }
  // Right Neighbor
  findRightNeighbor(cell: cellState) {
    let neighbor: cellNeighbors = {
      xCoord: this.xCoordCalc(cell.xCoord, "upper"),
      yCoord: cell.yCoord,
      cellId: this.rightNeighbor(cell),
    };
    return neighbor;
  }
  // Left Neighbor
  findLeftNeighbor(cell: cellState) {
    let neighbor: cellNeighbors = {
      xCoord: this.xCoordCalc(cell.xCoord, "lower"),
      yCoord: cell.yCoord,
      cellId: this.leftNeighbor(cell),
    };
    return neighbor;
  }
  // Coordinate Calculator
  xCoordCalc(x, direction: string) {
    if (direction == "lower") {
      // X Lower Coordinate left neighbor
      if (!this.xBoundaryCondition(x, "lower")) {
        return null;
      } else {
        return x - 1;
      }
    } else if (direction == "upper") {
      // X Upper Coordinate right neighbor
      if (!this.xBoundaryCondition(x, "upper")) {
        return null;
      } else {
        return x + 1;
      }
    }
  }
  yCoordCalc(y, direction: string) {
    if (direction == "lower") {
      // Y Lower Coordinate Top neighbor
      if (!this.yBoundaryCondition(y, "lower")) {
        return null;
      } else {
        return y - 1;
      }
    } else if (direction == "upper") {
      // Y Upper Coordinate Bootom neighbor
      if (!this.yBoundaryCondition(y, "upper")) {
        return null;
      } else {
        return y + 1;
      }
    }
  }
  // x Coordinate Boundary Condition Setter Returns Boolean
  xBoundaryCondition(x, direction: string) {
    if (direction == "lower") {
      if (x - 1 < 0) {
        return false;
      } else {
        return true;
      }
    } else if (direction == "upper") {
      if (x + 1 >= this.gridCol.length) {
        return false;
      } else {
        return true;
      }
    }
  }
  // y Coordinate Boundary Condition Setter Returns Boolean
  yBoundaryCondition(y, direction: string) {
    if (direction == "lower") {
      if (y - 1 < 0) {
        return false;
      } else {
        return true;
      }
    } else if (direction == "upper") {
      if (y + 1 >= this.gridRow.length) {
        return false;
      } else {
        return true;
      }
    }
  }
  // Top Neighbor CellId Calculator
  topNeighbor(cell: any): number {
    if (this.yBoundaryCondition(cell.yCoord, "lower")) {
      return cell.xCoord + this.gridCol.length * (cell.yCoord - 1);
    } else return null;
  }
  botNeighbor(cell: any): number {
    if (this.yBoundaryCondition(cell.yCoord, "upper")) {
      return cell.xCoord + this.gridCol.length * (cell.yCoord + 1);
    } else return null;
  }
  rightNeighbor(cell: any): number {
    if (this.xBoundaryCondition(cell.xCoord, "upper")) {
      return cell.xCoord + 1 + this.gridCol.length * cell.yCoord;
    } else return null;
  }
  leftNeighbor(cell: any): number {
    if (this.xBoundaryCondition(cell.xCoord, "lower")) {
      return cell.xCoord - 1 + this.gridCol.length * cell.yCoord;
    } else return null;
  }
  resetCells() {
    this.assignProp();
    // Set Start and End Nodes
    this.setStartEnd(
      this.startingCell[0],
      this.startingCell[1],
      this.endingCell[0],
      this.endingCell[1]
    );
    // this.CELLS.forEach((cell) => {
    //   cell.visited = false;
    //   cell.distanceFromStart = Infinity;
    // });
    // this.setStartEnd(15, 11, 35, 11);
    this.foundTarget = false;
  }

  animateStep() {
    this.CELLS.forEach((element) => {
      element.visited = false;
    });
    // console.log(this.exploreOrder[0]);
    var djikstraVisualiser = setInterval(
      () => this.step(djikstraVisualiser),
      5
    );
    // if(this.CELLS[this.exploreOrder[0]])
  }
  step(clear) {
    if (this.CELLS[this.exploreOrder[0]] == undefined) {
      console.log("clear");
      clearInterval(clear);
    } else {
      this.CELLS[this.exploreOrder[0]].visited = true;
      this.exploreOrder.shift();
    }
  }
}
