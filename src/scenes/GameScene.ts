import Phaser from 'phaser';
import Tetris from '../sprites/Tetris';
import { TetrisConfig } from '../configs/TetrisConfig';
import { Directions } from '../enums/Directions';
import LayerTetris from '../sprites/LayerTetris';
import { TetrisShapes } from '../enums/TetrisShapes';
import { getMatrixPos, makeTetrisMatrix } from '~utils/TetrisMatrixUtil';
import { IPosition } from '../interfaces/IPosition';
import { IMatrixPostion } from '../interfaces/IMatrix';

export default class GameScene extends Phaser.Scene {

    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private currentBlcok?: Tetris;
    private mainMatrix?: number[][];
    private mainBlocks?: Map<string, LayerTetris>;
    private _staticLayer?: Phaser.GameObjects.Group;
    private _tetrisGroup?: Phaser.GameObjects.Group;
    private _pauseUpdate: boolean;
    private _bornPos: IMatrixPostion;
    private _nextBlock?: Tetris;
    private _predictBlockRect?: Phaser.Geom.Rectangle;

    constructor() {
        super('GameScene');
        this._pauseUpdate  = false;
        this._bornPos = {
            row: 1,
            col: 5
        }
    }

    init(){
        this.mainMatrix = new Array<Array<number>>();
        this.mainBlocks = new Map<string, LayerTetris>();
    }

    create()
    {
        const gridNetWidth = TetrisConfig.GridColumns * TetrisConfig.GridTileW;
        const gridNetHeight = TetrisConfig.GridRows * TetrisConfig.GridTileH;

        for(let i = 0; i < TetrisConfig.GridRows; i++){
            let arr = new Array<number>();
            for(let j = 0; j < TetrisConfig.GridColumns; j++){
                arr.push(0);
            }
            this.mainMatrix?.push(arr);
        }

        const gridDrawBg = this.add.grid(
            TetrisConfig.GridOffsetW, TetrisConfig.GridOffsetH,
            gridNetWidth, gridNetHeight,
            TetrisConfig.GridTileW, TetrisConfig.GridTileH,
            0x00b9f2
        ).setAltFillStyle(0x016fce).setOutlineStyle();
        gridDrawBg.setOrigin(0);
       
        const predictBlockGraphic = this.add.graphics({
            lineStyle: {
                width: 2,
                color: 0x000000,
                alpha: 1
            }
        }); 
        
        this._predictBlockRect = new Phaser.Geom.Rectangle(
            gridDrawBg.x + gridDrawBg.width + 10,
            gridDrawBg.y,
            TetrisConfig.GridOffsetW * 5,
            TetrisConfig.GridOffsetH * 5
        );

        predictBlockGraphic.strokeRectShape(this._predictBlockRect);

        this._tetrisGroup = this.add.group({
            classType: Tetris,
            createCallback: item => {
                let tetris = item as Tetris;
                tetris.x += TetrisConfig.GridTileW * 0.5;
                tetris.y += TetrisConfig.GridTileH * 0.5;

                let randShape = Phaser.Math.Between(TetrisShapes.OrangeRicky, TetrisShapes.Hero);
                let randRotate = Phaser.Math.Between(0, 3);
                tetris.makeShape(randShape);

                while(randRotate > 0){
                    tetris.turn(true);
                    randRotate--;
                }

                tetris.setMainMatrix(this.mainMatrix!);
            }
        });

        this.currentBlcok = this.createTetrisBlock(this._bornPos.row, this._bornPos.col);

        this._staticLayer = this.add.group({
            classType: LayerTetris,
            createCallback: item => {
                let layerTetris = item as LayerTetris;
                layerTetris.x += TetrisConfig.GridTileW * 0.5;
                layerTetris.y += TetrisConfig.GridTileH * 0.5;
            }
        });

        this.physics.world.setBounds(
            TetrisConfig.GridTileW, 0,
            gridDrawBg.width, gridDrawBg.height + TetrisConfig.GridOffsetH,
            true, true, false, true
            );

        this.cursor = this.input.keyboard.createCursorKeys();

        //this.cameras.main.setBounds(TetrisConfig.GridTileW, 0, gridNetWidth, gridNetHeight);
        
        this.add.graphics()
        .lineStyle(5, 0x00ffff, 0.5)
        .strokeRectShape(this.physics.world.bounds);


    }

    update() {

        if (!this.cursor || !this.currentBlcok || this._pauseUpdate){
            return;
        }

        const keys = {
            left: Phaser.Input.Keyboard.JustDown(this.cursor.left),
            right: Phaser.Input.Keyboard.JustDown(this.cursor.right),
            up: Phaser.Input.Keyboard.JustDown(this.cursor.up),
            down: Phaser.Input.Keyboard.JustDown(this.cursor.down),
            space: Phaser.Input.Keyboard.JustDown(this.cursor.space)
        };

        if (keys.left){
            this.currentBlcok.move(Directions.LEFT);
        }
        else if (keys.right){
            this.currentBlcok.move(Directions.RIGHT);                
        }
        else if (keys.up){
            this.currentBlcok.turn(false);           
        }
        else if (keys.down){
            this.currentBlcok.move(Directions.DOWN);                
        }
        else if (keys.space){
            this.currentBlcok.turn(true);
        }

        if (this.currentBlcok.isFrozen){
            this.updateMainMatrix(this.currentBlcok);

            this.checkAndEliminateTetrisRows();

            this.currentBlcok = this.createTetrisBlock(this._bornPos.row, this._bornPos.col);
        }
    }

    updateMainMatrix(tetris: Tetris){
        if (!this.mainMatrix || !this.mainBlocks){
            return;
        }

        let posArray = tetris.getBlockPosArray();
        
        posArray.forEach(block => {
            let matrixPos = getMatrixPos({x: block.x, y: block.y}, -1, -1);
            if (matrixPos.row >= 0 && matrixPos.col >= 0){
                
                let matrixLayerBlock = this.createTetrisLayerBlock(matrixPos.row, matrixPos.col);

                let blockKey = `${matrixPos.row},${matrixPos.col}`;

                this.mainMatrix![matrixPos.row][matrixPos.col] = 1;

                this.mainBlocks!.set(blockKey, matrixLayerBlock);
            }
        });

        tetris.destroy();
    }

    private createTetrisBlock(row?: number, col?: number): Tetris{
        if (!this._tetrisGroup){
            throw new Error('TetrisGroup is not defined!');
        }
        
        if (row === undefined){
            row = this._bornPos.row;
        }

        if (col === undefined){
            col = this._bornPos.col;
        }

        let newBlock:Tetris;

        if (this._nextBlock){
            newBlock = this._nextBlock;
            newBlock.setPosition(
                TetrisConfig.GridTileW * col  + TetrisConfig.GridOffsetW * 1.5,
                TetrisConfig.GridTileH * row + TetrisConfig.GridOffsetH * 1.5
            );
            newBlock.setFrozen(false);
        }
        else{
            newBlock = this._tetrisGroup.get(
                TetrisConfig.GridTileW * col  + TetrisConfig.GridOffsetW,
                TetrisConfig.GridTileH * row + TetrisConfig.GridOffsetH
            ) as Tetris;
        }

        this._nextBlock = this._tetrisGroup.get(
            TetrisConfig.GridTileW * col  + TetrisConfig.GridOffsetW,
            TetrisConfig.GridTileH * row + TetrisConfig.GridOffsetH
        ) as Tetris;
        this._nextBlock.setFrozen(true);
        this._nextBlock.setPosition(
            this._predictBlockRect!.x + this._predictBlockRect!.width * 0.5,
            this._predictBlockRect!.y + this._predictBlockRect!.height * 0.5,
        )

        return newBlock;
    }

    private createTetrisLayerBlock(row: number, col: number): LayerTetris{
        if (!this._staticLayer){
            throw new Error('StaticLayer is not defined!');
        }
        
        return this._staticLayer.get(
            TetrisConfig.GridTileW * col + TetrisConfig.GridOffsetW,
            TetrisConfig.GridTileH * row + TetrisConfig.GridOffsetH
        ) as LayerTetris;
    }

    private checkAndEliminateTetrisRows(){
        if (!this.mainMatrix){
            return;
        }

        // which rows will eliminate
        let eliminateRows: Array<number> = [];

        // which rows should moving down
        let rowMovingSteps: Array<number> = [];
        let rowIdx = 0;
        while(rowIdx < TetrisConfig.GridRows){
            rowMovingSteps.push(0);
            rowIdx++;
        }

        // sort row index: big -> small
        for(let i = this.mainMatrix.length - 1; i > 0; i--){
            let arr = this.mainMatrix[i];

            // the row all values 1
            if (arr.indexOf(0) === -1){
                
                eliminateRows.push(i);

                rowIdx = 0;
                while(rowIdx < i){
                    rowMovingSteps[rowIdx]++;
                    rowIdx++;
                }
            }
        }

        console.log(this.mainMatrix, eliminateRows);
        if (eliminateRows.length > 0){
            rowIdx = TetrisConfig.GridRows;
            while(rowIdx >= 0){
                
                // the row will not eliminate, it moving down
                if (eliminateRows.indexOf(rowIdx) === -1){
                    let step = rowMovingSteps[rowIdx];

                    // if step is zero, its means keep stable
                    if (step > 0){
                        this.mainMatrix[rowIdx + step] = this.mainMatrix[rowIdx];

                        let colIdx = 0;
                        while(colIdx < TetrisConfig.GridColumns){
                            let blockKey = `${rowIdx},${colIdx}`;
                            let block = this.mainBlocks?.get(blockKey);

                            if (block){
                                block.setPosition(block.x, block.y + TetrisConfig.GridOffsetH * step);
                                // update key
                                this.mainBlocks?.delete(blockKey);
                                this.mainBlocks?.set(`${rowIdx + step},${colIdx}`, block);
                            }

                            colIdx++;
                        }
                    }
                }
                else{
                    let colIdx = 0;
                    while(colIdx < TetrisConfig.GridColumns){
                        let blockKey = `${rowIdx},${colIdx}`;
                        let block = this.mainBlocks?.get(blockKey);

                        if (block){
                            this.mainBlocks?.delete(blockKey);
                            block.destroy();
                        }
                        
                        colIdx++;
                    }
                }

                rowIdx--;
            }
        }
    }
}
