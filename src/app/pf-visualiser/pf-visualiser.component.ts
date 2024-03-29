import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { CellCoordinates } from "../models/cell-coordinates";
import { cellState, cellNeighbors } from "./cellState";

@Component({
  selector: "app-pf-visualiser",
  templateUrl: "./pf-visualiser.component.html",
  styleUrls: ["./pf-visualiser.component.css"],
})
export class PfVisualiserComponent implements OnInit {
  gridRow: any;
  gridCol: number[];
  maxRow: number;
  maxCol: number;
  selectedCell: cellState;
  CELLS: cellState[];
  cellIdStr: string[] = [];
  startingCell: CellCoordinates;
  endingCell: CellCoordinates;
  path: cellState[];
  pathImpossible: boolean;
  mouseDown: boolean;
  loading: boolean;
  currentCell: cellState | undefined;

  constructor(private _toastrService: ToastrService) {
    this.gridRow = [];
    this.gridCol = [];
    this.maxRow = 25;
    this.maxCol = 50;
    this.startingCell = {
      xCoord: 15,
      yCoord: 11,
    };
    this.endingCell = {
      xCoord: 45,
      yCoord: 11,
    };
    this.CELLS = [];
    this.cellIdStr = [];
    this.selectedCell = {
      cellId: 0,
      xCoord: 0,
      yCoord: 0,
      cellIdstr: "",
      start: false,
      end: false,
      visited: false,
      wall: false,
      path: false,
      distanceFromStart: Infinity,
      previousCell: null,
    };
    this.path = [];
    this.mouseDown = false;
    this.loading = false;
    this.pathImpossible = false;
    this.currentCell = undefined;
  }

  ngOnInit() {
    this.generateGrid();
  }

  generateGrid(): void {
    this.gridRow = Array.from(Array(this.maxRow)).map((x, i) => i);
    this.gridCol = Array.from(Array(this.maxCol)).map((y, j) => j);

    // Initialise Grid Properties
    this.createCellID(this.maxRow, this.maxCol);

    // Populate CELLS Object
    this.assignProp();

    // Set Start and End Nodes
    this.setStartEnd(this.startingCell, this.endingCell);

    // Clear grid
    this.clearGrid();
  }

  // Function to Initialise Grid Properties
  createCellID(Row: number, Col: number) {
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

  setStartEnd(start: CellCoordinates, end: CellCoordinates) {
    var startId: number = start.xCoord + this.maxCol * start.yCoord;
    var endId: number = end.xCoord + this.maxCol * end.yCoord;
    this.CELLS[startId].start = true;
    this.CELLS[startId].distanceFromStart = 0;
    this.CELLS[endId].end = true;
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
        wall: false,
        path: false,
        distanceFromStart: Infinity,
        previousCell: null,
      };
    }
  }

  drag(x: number, y: number): void {
    let cell: cellState = this.CELLS[x + this.maxCol * y];
    this.selectedCell = cell;

    if (
      this.CELLS[this.endingCell.xCoord + this.maxCol * this.endingCell.yCoord]
        .visited
    ) {
      this.resetGrid();
    }
    if (!this.selectedCell.start && !this.selectedCell.end) {
      this.mouseDown = true;
      this.selectedCell.wall = !this.selectedCell.wall;
    }
  }
  drop(x: number, y: number): void {
    this.mouseDown = false;
    let cell: cellState = this.CELLS[x + this.maxCol * y];
    if (this.selectedCell.start && this.selectedCell.cellId != cell.cellId) {
      this.CELLS[x + this.maxCol * y].start = true;
      this.CELLS[x + this.maxCol * y].distanceFromStart = 0;

      this.selectedCell.start = false;
      this.selectedCell.distanceFromStart = Infinity;

      // Update starting cell
      this.startingCell = this.CELLS[x + this.maxCol * y];
    } else if (
      this.selectedCell.end &&
      this.selectedCell.cellId != cell.cellId
    ) {
      this.CELLS[x + this.maxCol * y].end = true;

      this.selectedCell.end = false;

      // Update ending cell
      this.endingCell = this.CELLS[x + this.maxCol * y];
    }
  }
  addWall(x: number, y: number): void {
    let cell: cellState = this.CELLS[x + this.maxCol * y];

    if (this.mouseDown && !cell.start && !cell.end) {
      cell.wall = !cell.wall;
    }
  }
  eraseWall(x: number, y: number, e: MouseEvent): void {
    e.preventDefault();
    console.log(e);
    let cell: cellState = this.CELLS[x + this.maxCol * y];

    if (this.mouseDown && cell.wall) {
      cell.wall = false;
    }
  }

  visualiseDijkstra(): void {
    this.loading = true;

    let unvisited: cellState[] = this.CELLS.filter(
      (c) => !c.visited && !c.wall
    );
    let endCellId: number = this.CELLS.findIndex((c) => c.end);
    this.currentCell = unvisited
      .sort((a, b) => a.distanceFromStart - b.distanceFromStart)
      .shift();
    this.path.push(this.CELLS[endCellId]);

    let interval = setInterval(() => {
      // console.log("unvisited", unvisited);
      // Sort unvisited

      // console.log("currentNode", currentCell);

      if (this.currentCell) {
        // Top neighbor
        this.neighborCellUpdate(this.currentCell, unvisited, 0, -1);

        // Bottom neighbor
        this.neighborCellUpdate(this.currentCell, unvisited, 0, 1);

        // Left neighbor
        this.neighborCellUpdate(this.currentCell, unvisited, -1, 0);

        // Right neighbor
        this.neighborCellUpdate(this.currentCell, unvisited, 1, 0);

        // Set current cell to visited
        this.currentCell.visited = true;
      }
      // Update current cell
      this.currentCell = unvisited
        .sort((a, b) => a.distanceFromStart - b.distanceFromStart)
        .shift();

      // Clear interval
      if (
        this.CELLS[endCellId].visited ||
        this.currentCell?.distanceFromStart == Infinity
      ) {
        this.currentCell = undefined;
        this.tracePath();
        clearInterval(interval);
      }
    }, 5);
  }

  coordToCellId(
    xCoord: number | undefined,
    yCoord: number | undefined
  ): number | null {
    if (
      xCoord == undefined ||
      yCoord == undefined ||
      xCoord < 0 ||
      yCoord < 0 ||
      xCoord > this.maxCol - 1 ||
      yCoord > this.maxRow - 1
    ) {
      return null;
    } else {
      return xCoord + this.maxCol * yCoord;
    }
  }

  neighborCellUpdate(
    currentCell: cellState,
    unvisited: cellState[],
    xCoordAdjust: number,
    yCoordAdjust: number
  ): void {
    let neighborCellId: number | null = this.coordToCellId(
      currentCell.xCoord + xCoordAdjust,
      currentCell.yCoord + yCoordAdjust
    );
    if (
      neighborCellId != null &&
      unvisited.includes(this.CELLS[neighborCellId])
    ) {
      let neighbor: cellState = this.CELLS[neighborCellId];

      // Adjust distance from start
      let changeInX: number = neighbor.xCoord - currentCell.xCoord;
      let changeInY: number = neighbor.yCoord - currentCell.yCoord;

      // Update distance again if shorter one is found
      let altDistance: number = currentCell.distanceFromStart + 1; // using this simple distance for artistic triangular effect

      if (altDistance < neighbor.distanceFromStart) {
        neighbor.distanceFromStart = altDistance;

        // Update previous cell to track for path
        neighbor.previousCell = currentCell.cellId;
      }
    }
  }

  tracePath(): void {
    for (let i = 0; i < this.CELLS.length; i++) {
      let nextCellId: number = this.CELLS.findIndex((c) => {
        if (this.path.length - 1 < i) {
          return false;
        }
        return c.cellId == this.path[0 + i].previousCell;
      });

      if (nextCellId >= 0) {
        this.path.push(this.CELLS[nextCellId]);
      } else {
        break;
      }
    }
    console.log("path", this.path);

    // Reverse path
    this.path.reverse();
    if (
      this.path[0] ==
      this.CELLS[
        this.startingCell.xCoord + this.maxCol * this.startingCell.yCoord
      ]
    ) {
      // Animate path
      let index: number = 0;
      let interval = setInterval(() => {
        this.path[index].path = true;

        index++;
        if (index == this.path.length) {
          this.loading = false;
          // Path finding success
          this._toastrService.success("😤👌", "", {
            timeOut: 1000,
          });
          clearInterval(interval);
        }
      }, 50);
    } else {
      // Path finding failed, alert user
      this._toastrService.error("Pathing impossible! 🙅‍♀️", "", {
        disableTimeOut: true,
      });
      this.pathImpossible = true;

      this.loading = false;
    }
  }

  resetGrid(): void {
    this.path = [];
    this.pathImpossible = false;
    this.currentCell = undefined;

    this.CELLS.forEach((cell, index) => {
      this.CELLS[index].visited = false;
      this.CELLS[index].distanceFromStart = Infinity;
      this.CELLS[index].start = false;
      this.CELLS[index].end = false;
      this.CELLS[index].path = false;
      this.CELLS[index].previousCell = null;
    });

    this.setStartEnd(this.startingCell, this.endingCell);
  }
  clearGrid(): void {
    this.resetGrid();

    this.CELLS.forEach((cell) => {
      cell.wall = false;
    });
  }
  // testCell = {} as cellState;
  // test(x: number, y: number, e: MouseEvent): void {
  //   e.preventDefault();
  //   console.log(this.CELLS[x + this.maxCol * y]);
  //   this.testCell = this.CELLS[x + this.maxCol * y];
  // }
}
