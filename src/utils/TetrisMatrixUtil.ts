import { IPosition } from "../interfaces/IPosition";
import { TetrisShapes } from "../enums/TetrisShapes";
import { Directions } from "../enums/Directions";
import { TetrisConfig } from "../configs/TetrisConfig";
import { IMatrixPostion } from "../interfaces/IMatrix";

const makeTetrisMatrix = (shape: TetrisShapes) => {
    let matrix: number[][] = [];

    switch(shape){
        case TetrisShapes.BlueRicky:{
            
            matrix = [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.OrangeRicky:{
            
            matrix = [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.ClevelandZ:{
            
            matrix = [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.RhodeIslandZ:{
            
            matrix = [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.Teewee:{
            
            matrix = [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.SmashBoy:{
            
            matrix = [
                [1, 1, 0],
                [1, 1, 0],
                [0, 0, 0]
            ];
            
            break;
        }
        case TetrisShapes.Hero:{
            
            matrix = [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            
            break;
        }
        default:{
            break;
        }
    }

    return matrix;
};

const getBoundBlockPosition = (matrix: number[][], op: IMatrixPostion, boundDir: Directions) => {
    let marginBlocks = 0;

    let matchPos:IMatrixPostion = op;

    for(let row = 0; row < matrix.length; row++){
        let arr = matrix[row];
        for(let col = 0; col < arr.length; col++){
            let p = arr[col];

            if (p){
                if (boundDir == Directions.LEFT && col <= matchPos.col && row >= matchPos.row){
                    matchPos = {row, col};
                }
                else if (boundDir == Directions.RIGHT && col >= matchPos.col && row >= matchPos.row){
                    matchPos = {row, col};
                }
                else if (boundDir == Directions.DOWN && row >= matchPos.row){
                    matchPos = {row, col};
                }
            }
        }
    }

    return matchPos;
};

const getMatrixPos = (worldPos: IPosition, offsetRow: number = 0, offsetCol: number = 0) => {

    let matrixPos: IMatrixPostion = {
        row: Math.floor(worldPos.y / TetrisConfig.GridTileH + offsetRow),
        col: Math.floor(worldPos.x  / TetrisConfig.GridTileW + offsetCol)
    }
    return matrixPos;
}

const boundMatrixBlock = (posArr:Array<IPosition>, matrix: number[][], dir: Directions) => {
    let offsetRow = 0;
    let offsetCol = 0;
    let boundResult = false;
    switch(dir){
        case Directions.LEFT:{
            offsetCol = -1;
            break;
        }
        case Directions.RIGHT:{
            offsetCol = 1;
            break;
        }
        case Directions.DOWN:{
            offsetRow = 1;
            break;
        }
    }

    for(let i = 0; i < posArr.length; i++){

        let pos = posArr[i];
        let matrixPos = getMatrixPos(pos);

        if (matrixPos.row < 0){
            continue;
        }
        
        // when the matrix turn, it's position may be wrong.
        if (matrixPos.col < 0 || matrix[matrixPos.row][matrixPos.col]){
            boundResult = true;
            break;
        }
        
        let nextRow = matrixPos.row + offsetRow;
        let nextCol = matrixPos.col + offsetCol;

        if (
            nextRow >= matrix.length || 
            nextCol < 0 || 
            nextCol >= matrix[matrixPos.row].length || 
            matrix[nextRow][nextCol]
            ){
            boundResult = true;
            break;
        }
    }

    return boundResult;
}

export {
    makeTetrisMatrix,
    getBoundBlockPosition,
    getMatrixPos,
    boundMatrixBlock
}