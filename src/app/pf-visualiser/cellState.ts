export interface cellState {
    cellId: number;
    xCoord: number;
    yCoord: number;
    cellIdstr: string;
    start: boolean;
    end: boolean;
    visited: boolean;
    path: boolean;
    distanceFromStart: number;
    previousCell: number;
}

export interface cellNeighbors {
    xCoord: number;
    yCoord: number;
    cellId: number;
}
