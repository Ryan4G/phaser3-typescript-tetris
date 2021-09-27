import { Directions } from "../enums/Directions";
import { TetrisShapes } from "../enums/TetrisShapes";
import { IPosition } from "./IPosition";

interface ITetris{
    
    isFrozen: boolean;
    speed: number;
    shape: TetrisShapes;
    matrix: Array<Array<number>>;

    setSpeed(s: number): ITetris;

    setFrozen(frozen: boolean): ITetris;

    turn(clockwise: boolean):void;

    move(dir: Directions):void;

    makeShape(shape: TetrisShapes): ITetris;

    preUpdate(d: number, dt: number): void;

    getBlockPosArray(): Array<IPosition>;

    setMainMatrix(matrix: Array<Array<number>>): void;
}

export {
    ITetris
}