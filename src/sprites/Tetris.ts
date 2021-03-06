import { TetrisConfig } from "../configs/TetrisConfig";
import { Directions } from "../enums/Directions";
import { TetrisShapes } from "../enums/TetrisShapes";
import { ITetris } from "../interfaces/ITetris";
import { boundMatrixBlock, getBoundBlockPosition, getMatrixPos, makeTetrisMatrix } from "../utils/TetrisMatrixUtil";
import { IPosition } from "../interfaces/IPosition";
import LayerTetris from "./LayerTetris";
import { IMatrixPostion } from "../interfaces/IMatrix";

export default class Tetris extends Phaser.GameObjects.Container implements ITetris{

    private _isFrozen: boolean = false;
    private _rotate: number = 0;
    private _speed: number = 12;
    private _updateTimes: number = 0;
    private _blockArr: Array<Phaser.GameObjects.Rectangle>;
    private _shape: TetrisShapes;
    private _matrix: Array<Array<number>>;
    private _originPos: IMatrixPostion;
    private _mainMatrix?: Array<Array<number>>;
    private _hardDrop?: boolean = false;

    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world. Default 0.
     * @param y The vertical position of this Game Object in the world. Default 0.
     * @param children An optional array of Game Objects to add to this Container.
     */
    constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[]){
        super(scene, x, y, children);

        let tileW = TetrisConfig.GridTileW;
        let tileH = TetrisConfig.GridTileH;

        const block_0 = scene.add.rectangle(-tileW,-tileH, tileW, tileH, 0xffffff);
        const block_1 = scene.add.rectangle(-tileW,     0, tileW, tileH, 0xffffff);
        const block_2 = scene.add.rectangle(     0,     0, tileW, tileH, 0xffffff);
        const block_3 = scene.add.rectangle( tileW,     0, tileW, tileH, 0xffffff);

        this._blockArr = [block_0, block_1, block_2, block_3];
        this.add(this._blockArr);

        this._shape = TetrisShapes.BlueRicky;

        this._matrix = [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ];

        this._originPos = {row: 1, col: 1};
        this._hardDrop = false;
    }

    get isFrozen(){
        return this._isFrozen;
    }

    get speed(){
        return this._speed;
    }

    get shape(){
        return this._shape;
    }

    get matrix(){
        return this._matrix;
    }
    
    setSpeed(s: number){
        this._speed = Math.max(1, Math.min(32, s));
        return this;
    }
    
    setFrozen(frozen: boolean){
        this._isFrozen = frozen;
        return this;
    }

    turn(clockwise: boolean, resetZero?: boolean){

        if (this._isFrozen || !this._mainMatrix || this._hardDrop){
            return;
        }

        if (resetZero){
            this._rotate = 0;
            this._matrix = makeTetrisMatrix(this._shape);
            this.resetOriginPos(this._shape);
            this.setRotation(0);
            return;
        }

        let nextRotate = this._rotate;
        let nextMatrix: number[][] = [];

        // avoid the array reference..!!
        this._matrix.forEach(arr => {
            nextMatrix.push(arr.slice());
        });
        
        if (this._shape === TetrisShapes.SmashBoy){
            return;
        }
        else if (this.shape === TetrisShapes.Hero){

            if (nextRotate > 0){
                nextRotate = 0;
                
                nextMatrix = Phaser.Utils.Array.Matrix.RotateLeft(nextMatrix);
            }
            else{
                nextRotate = 1;
                
                nextMatrix = Phaser.Utils.Array.Matrix.RotateRight(nextMatrix);
            }
        }
        else{
            if (clockwise){
                nextRotate++;
                nextMatrix = Phaser.Utils.Array.Matrix.RotateRight(nextMatrix);
            }
            else{
                nextRotate--;
                nextMatrix = Phaser.Utils.Array.Matrix.RotateLeft(nextMatrix);
            }

            if (Math.abs(nextRotate) >= 4){
                nextRotate = 0;
            }
        }
        
        let posArr = this.getBlockPosArray(nextMatrix);

        let downBound = boundMatrixBlock(posArr, this._mainMatrix, Directions.DOWN);

        if (downBound){
            return;
        }

        this._matrix = nextMatrix;
        this._rotate = nextRotate;
        this.setRotation(Math.PI * 0.5 * nextRotate);
        // the matrix rotate will effect the origin pos (only hero)
        this.resetOriginPos(this._shape);

        this.scene.sound.play('rotate');
    }

    move(dir: Directions){

        if (this._isFrozen || !this._mainMatrix || this._hardDrop){
            return;
        }
        
        let currX = this.x;
        let currY = this.y;
        let desX = currX;
        let desY = currY;
        
        // let boundPos = getBoundBlockPosition(this._matrix, this._originPos, dir);

        // desX += (boundPos.col - this._originPos.col) * TetrisConfig.GridTileW;
        // desY += (boundPos.row - this._originPos.row) * TetrisConfig.GridTileH;

        let posArr = this.getBlockPosArray();

        if (boundMatrixBlock(posArr, this._mainMatrix, dir)){
            return;
        }
        
        switch(dir){
            case Directions.LEFT: {

                //desX -= TetrisConfig.GridTileW;
                currX -= TetrisConfig.GridTileW;
                break;
            }
            case Directions.RIGHT: {
                //desX += TetrisConfig.GridTileW;
                currX += TetrisConfig.GridTileW;
                break;
            }
            case Directions.DOWN: {
                
                //desY += TetrisConfig.GridTileH;

                currY += TetrisConfig.GridTileH;
                
                break;
            }
        }

        this.setPosition(currX, currY);
        
        this.scene.sound.play('move');
    }

    makeShape(shape: TetrisShapes){

        this._shape = shape;

        this.resetOriginPos(shape);

        this._matrix = makeTetrisMatrix(shape);

        let pdx = 0;
    
        for(let row = 0; row < this._matrix.length; row++){
            let arr = this._matrix[row];
            for(let col = 0; col < arr.length; col++){
                // check the point is 1, then caculate position
                let p = arr[col];

                if (p){
                    let pos: IPosition = {
                        x: (col - this._originPos.col) * TetrisConfig.GridTileW,    // caculate width
                        y: (row - this._originPos.row) * TetrisConfig.GridTileH     // caculate height
                    };

                    let block = this._blockArr[pdx++];
                    block.setPosition(pos.x, pos.y);
                }
            }
        }

        return this;
    }

    preUpdate(d: number, dt: number){

        if (this._isFrozen || !this._mainMatrix){
            return;
        }

        if (this._updateTimes++ < Math.floor(32 - this._speed)){
            return;
        }
        
        this._updateTimes = 0;

        let orgY = this.y;
        
        let posArr = this.getBlockPosArray();

        if (boundMatrixBlock(posArr, this._mainMatrix, Directions.DOWN)){
            this._isFrozen = true;

            this.scene.sound.play('lock');

            if (this._hardDrop){
                this._hardDrop = false;
            }
        }
        else{
            this.y = orgY + TetrisConfig.GridTileH;
        }
    }

    getBlockPosArray(matrix?: number[][]){

        if (!matrix){
            matrix = this._matrix;
        }

        const posArray = new Array<IPosition>();

        let pdx = 0;
    
        for(let row = 0; row < matrix.length; row++){
            let arr = matrix[row];
            for(let col = 0; col < arr.length; col++){
                // check the point is 1, then caculate position
                let p = arr[col];

                if (p){
                    let pos: IPosition = {
                        x: (col - this._originPos.col) * TetrisConfig.GridTileW + this.x,
                        y: (row - this._originPos.row) * TetrisConfig.GridTileH + this.y
                    };

                    
                    posArray.push(pos);
                }
            }
        }

        return posArray;
    }

    setMainMatrix(matrix: Array<Array<number>>){
        this._mainMatrix = matrix;
    }

    makeHardDrop(){
        this._hardDrop = true;

        this.setSpeed(32);
        
        this.scene.sound.play('hardDrop');
    }

    private resetOriginPos(shape: TetrisShapes){
        // rest origin position
        if (shape === TetrisShapes.Hero){
            this._originPos = this._rotate === 0 ? {row: 1, col: 2} : {row: 2, col: 2};
        }
        else{
            this._originPos = {row: 1, col: 1};
        }
    }
}