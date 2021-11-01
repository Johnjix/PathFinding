import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit } from "@angular/core";
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

  constructor() {
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
      path: false,
      distanceFromStart: Infinity,
      previousCell: null,
    };
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
        path: false,
        distanceFromStart: Infinity,
        previousCell: null,
      };
    }
  }

  drag(x: number, y: number): void {
    let cellId: number = x + this.maxCol * y;
    console.log("down", x, y);
    this.selectedCell = this.CELLS[cellId];
  }
  drop(x: number, y: number): void {
    console.log("up", x, y);
    let cellId: number = x + this.maxCol * y;
    if (this.selectedCell.start && this.selectedCell.cellId != cellId) {
      this.CELLS[x + this.maxCol * y].start = true;

      this.selectedCell.start = false;
    } else if (this.selectedCell.end && this.selectedCell.cellId != cellId) {
      this.CELLS[x + this.maxCol * y].end = true;

      this.selectedCell.end = false;
    }
  }
}
