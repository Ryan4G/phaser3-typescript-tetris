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
    private _score: number = 0;
    private keyBoard_Z?: Phaser.Input.Keyboard.Key;
    private keyBoard_C?: Phaser.Input.Keyboard.Key;
    private keyBoard_ESC?: Phaser.Input.Keyboard.Key;
    private _holdBlock?: Tetris;
    private _holdRelease?: boolean;
    private _gameOver: boolean = false;

    private _predictBlocks?: Array<Tetris>;
    private _predictNums: number = 3;
    private _levels: number = 1;
    private _eliminateLines: number = 0;

    private _predictBlockRect?: Phaser.Geom.Rectangle;
    private _holdBlockRect?: Phaser.Geom.Rectangle;
    private _scoreText?: Phaser.GameObjects.Text;
    private _linesText?: Phaser.GameObjects.Text;
    private _levelText?: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
        this._pauseUpdate  = false;
        this._bornPos = {
            row: 0,
            col: 5
        };
        this._predictBlocks = new Array<Tetris>();
    }

    init(){
        this.mainMatrix = new Array<Array<number>>();
        this.mainBlocks = new Map<string, LayerTetris>();
        this._score = 0;
        this._holdBlock = undefined;
        this._holdRelease = true;
    }

    create()
    {
        const gridNetWidth = TetrisConfig.GridColumns * TetrisConfig.GridTileW;
        const gridNetHeight = (TetrisConfig.GridRows - 1) * TetrisConfig.GridTileH;

        // init main matrix
        for(let i = 0; i < TetrisConfig.GridRows; i++){
            let arr = new Array<number>();
            for(let j = 0; j < TetrisConfig.GridColumns; j++){
                arr.push(0);
            }
            this.mainMatrix?.push(arr);
        }

        // init grid background
        const gridBackground = this.add.grid(
            0, TetrisConfig.GridTileH,
            gridNetWidth, gridNetHeight,
            TetrisConfig.GridTileW, TetrisConfig.GridTileH,
            0x000000
        ).setOutlineStyle(0x242323, 1);

        gridBackground.setOrigin(0);
       
        const predictText = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 2,
            gridBackground.y,
            'Next',
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        const gameSceneGraphic = this.add.graphics({
            lineStyle: {
                width: 2,
                color: 0x000000
            },
            fillStyle: {
                color: 0xffffff
            }
        }); 
        
        this._predictBlockRect = new Phaser.Geom.Rectangle(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW,
            gridBackground.y + TetrisConfig.GridTileH,
            TetrisConfig.GridTileW * 5,
            TetrisConfig.GridTileH * 9
        );

        gameSceneGraphic.strokeRectShape(this._predictBlockRect);

        const scoreTitle = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 1.5,
            TetrisConfig.GridTileH * 11,
            'Score',
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        this._scoreText = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW,
            TetrisConfig.GridTileH * 12.5,
            `${Array(7).join('0') + this._score}`.slice(-7),
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );
        
        const levelTitle = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 1.5,
            TetrisConfig.GridTileH * 14,
            'Level',
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        this._levelText = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 2,
            TetrisConfig.GridTileH * 15.5,
            `${Array(3).join('0') + this._levels}`.slice(-3),
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        const linesTitle = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 1.5,
            TetrisConfig.GridTileH * 17,
            'Lines',
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        this._linesText = this.add.text(
            gridBackground.x + gridBackground.width + TetrisConfig.GridTileW * 1.5,
            TetrisConfig.GridTileH * 18.5,
            `${Array(5).join('0') + this._eliminateLines}`.slice(-5),
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        const holdText = this.add.text(
            gridBackground.x - TetrisConfig.GridTileW * 5,
            gridBackground.y,
            'Hold',
            {
                fontSize: '3em',
                fontStyle: 'bolder'
            }
        );

        this._holdBlockRect = new Phaser.Geom.Rectangle(
            gridBackground.x - TetrisConfig.GridTileW * 6,
            gridBackground.y + TetrisConfig.GridTileH,
            TetrisConfig.GridTileW * 5,
            TetrisConfig.GridTileH * 3
        );
        
        const pauseRect = new Phaser.Geom.Rectangle(
            gridBackground.x - TetrisConfig.GridTileW  * 5.5,
            gridBackground.y + TetrisConfig.GridTileH * 16,            
            TetrisConfig.GridTileW * 4,
            TetrisConfig.GridTileH * 2
        );

        const pauseText = this.add.text(
            pauseRect.x + pauseRect.width * 0.5,
            pauseRect.y + pauseRect.height * 0.5,
            'Pause',
            {
                color: '#000',
                fontStyle: 'bolder'
            }
        ).setOrigin(0.5).setInteractive();

        pauseText.on(
            Phaser.Input.Events.POINTER_UP,
            () => {
                this.scene.pause();
                this.scene.launch('PauseUIScene');
            }
        );

        gameSceneGraphic.strokeRectShape(this._holdBlockRect);
        gameSceneGraphic.strokeRoundedRect(pauseRect.x, pauseRect.y, pauseRect.width, pauseRect.height, 10);
        gameSceneGraphic.fillRoundedRect(pauseRect.x, pauseRect.y, pauseRect.width, pauseRect.height, 10);

        this._tetrisGroup = this.add.group({
            classType: Tetris,
            createCallback: item => {
                let tetris = item as Tetris;
                tetris.x += TetrisConfig.GridTileW * 0.5;
                tetris.y += TetrisConfig.GridTileH * 0.5;

                let randShape = Phaser.Math.Between(TetrisShapes.OrangeRicky, TetrisShapes.Hero);
                tetris.setSpeed(tetris.speed - (this._levels - 1) * 0.05);
                tetris.makeShape(randShape);
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

        // this.physics.world.setBounds(
        //     TetrisConfig.GridTileW, 0,
        //     gridBackground.width, gridBackground.height,
        //     true, true, false, true
        //     );

        this.cursor = this.input.keyboard.createCursorKeys();

        this.keyBoard_Z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyBoard_C = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keyBoard_ESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.cameras.main.setBounds(- this.scale.width * 0.25, -TetrisConfig.GridTileH, this.scale.width, this.scale.height);
        
        // this.add.graphics()
        // .lineStyle(5, 0x00ffff, 0.5)
        // .strokeRectShape(this.physics.world.bounds);

        // this._debugText = this.add.text(
        //     gridBackground.x + gridBackground.width + 10,
        //     0,
        //     ''
        // );
    }

    update() {

        if (!this.cursor || !this.currentBlcok || this._pauseUpdate || this._gameOver){
            return;
        }

        const keys = {
            left: Phaser.Input.Keyboard.JustDown(this.cursor.left),
            right: Phaser.Input.Keyboard.JustDown(this.cursor.right),
            up: Phaser.Input.Keyboard.JustDown(this.cursor.up),
            down: Phaser.Input.Keyboard.JustDown(this.cursor.down),
            space: Phaser.Input.Keyboard.JustDown(this.cursor.space),
            z: Phaser.Input.Keyboard.JustDown(this.keyBoard_Z!),
            c: Phaser.Input.Keyboard.JustDown(this.keyBoard_C!),
            esc: Phaser.Input.Keyboard.JustDown(this.keyBoard_ESC!),
        };

        if (keys.left){
            this.currentBlcok.move(Directions.LEFT);
        }
        else if (keys.right){
            this.currentBlcok.move(Directions.RIGHT);                
        }
        else if (keys.up){
            this.currentBlcok.turn(true);           
        }
        else if (keys.down){
            this.currentBlcok.move(Directions.DOWN);                
        }
        else if (keys.z){
            this.currentBlcok.turn(false);  
        }
        else if (keys.c){
            this.holdTetrisBlock();  
        }
        else if (keys.space){
            this.currentBlcok.makeHardDrop();
        }

        if (this.currentBlcok.isFrozen){

            if (this.checkGameOver()){
                return;
            }

            this._score += 10;
            
            this.updateMainMatrix(this.currentBlcok);

            this.checkAndEliminateTetrisRows();

            this.currentBlcok = this.createTetrisBlock(this._bornPos.row, this._bornPos.col);

            if (!this._holdRelease){
                this._holdRelease = true;
            }
            // this._debugText?.setText(Phaser.Utils.Array.Matrix.MatrixToString(this.mainMatrix));
        }

        this._scoreText?.setText(`${Array(7).join('0') + this._score}`.slice(-7));
        this._levelText?.setText(`${Array(3).join('0') + this._levels}`.slice(-3));
        this._linesText?.setText(`${Array(5).join('0') + this._eliminateLines}`.slice(-5));
    }

    private updateMainMatrix(tetris: Tetris){
        if (!this.mainMatrix || !this.mainBlocks){
            return;
        }

        let posArray = tetris.getBlockPosArray();
        
        posArray.forEach(block => {
            let matrixPos = getMatrixPos({x: block.x, y: block.y});
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

        if (!this._predictBlocks){
            throw new Error('PridictBlocks is not inited!');
        }
        
        if (row === undefined){
            row = this._bornPos.row;
        }

        if (col === undefined){
            col = this._bornPos.col;
        }

        while(this._predictBlocks.length < this._predictNums + 1){
            let block = this._tetrisGroup.get(
                TetrisConfig.GridTileW * col,
                TetrisConfig.GridTileH * row
            ) as Tetris;
            block.setFrozen(true);
            block.setPosition(
                this._predictBlockRect!.x + this._predictBlockRect!.width * 0.5,
                this._predictBlockRect!.y + this._predictBlockRect!.height * 0.5,
            );

            this._predictBlocks.push(block);
        }


        let newBlock:Tetris = this._predictBlocks.splice(0, 1)[0];
        newBlock.setPosition(
            TetrisConfig.GridTileW * (col + 0.5),
            TetrisConfig.GridTileH * (row + 0.5)
        );
        newBlock.setFrozen(false);

        let idx = 0;
        this._predictBlocks.forEach(item => {
            let posX = this._predictBlockRect!.x + this._predictBlockRect!.width * 0.5;
            let posY = this._predictBlockRect!.y + idx / 3 * this._predictBlockRect!.height + TetrisConfig.GridTileH * 2;

            if (item.shape === TetrisShapes.SmashBoy){
                posX += TetrisConfig.GridTileW * 0.5;
            }
            else if (item.shape === TetrisShapes.Hero){
                posX += TetrisConfig.GridTileW * 0.5;
                posY -= TetrisConfig.GridTileH * 0.5;
            }

            item.setPosition(posX, posY);
            idx++;
        });

        return newBlock;
    }

    private createTetrisLayerBlock(row: number, col: number): LayerTetris{
        if (!this._staticLayer){
            throw new Error('StaticLayer is not defined!');
        }
        
        return this._staticLayer.get(
            TetrisConfig.GridTileW * col,
            TetrisConfig.GridTileH * row
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

        //console.log(this.mainMatrix, eliminateRows);
        if (eliminateRows.length > 0){
            rowIdx = TetrisConfig.GridRows;
            while(rowIdx >= 0){
                
                // the row will not eliminate, it moving down
                if (eliminateRows.indexOf(rowIdx) === -1){
                    let step = rowMovingSteps[rowIdx];

                    // if step is zero, its means keep stable
                    if (step > 0){
                        
                        let colIdx = 0;

                        while(colIdx < this.mainMatrix[rowIdx].length){
                            this.mainMatrix[rowIdx + step][colIdx] = this.mainMatrix[rowIdx][colIdx];
                            colIdx++;
                        }

                        colIdx = 0;

                        while(colIdx < TetrisConfig.GridColumns){
                            let blockKey = `${rowIdx},${colIdx}`;
                            let block = this.mainBlocks?.get(blockKey);

                            if (block){
                                block.setPosition(block.x, block.y + TetrisConfig.GridTileH * step);
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

            this._score += 100 * Math.pow(2, eliminateRows.length - 1);
        }

        this._eliminateLines += eliminateRows.length;

        let levelUpLines = this._levels * Math.min(50, (10 + Math.pow(2, this._levels - 1)));
        if (this._eliminateLines > levelUpLines){
            this._levels++;
        }
    }

    private holdTetrisBlock(){
        if (this.currentBlcok && !this.currentBlcok.isFrozen){
            
            if (this._holdRelease){
                let tmp = this._holdBlock;

                if (!tmp){
                    tmp = this.createTetrisBlock(this._bornPos.row, this._bornPos.col);
                }

                this._holdBlock = this.currentBlcok;

                this.currentBlcok = tmp;

                let posX = this._holdBlockRect!.x + this._holdBlockRect!.width * 0.5;
                let posY = this._holdBlockRect!.y + TetrisConfig.GridTileH * 2;
    
                if (this._holdBlock.shape === TetrisShapes.SmashBoy){
                    posX += TetrisConfig.GridTileW * 0.5;
                }
                else if (this._holdBlock.shape === TetrisShapes.Hero){
                    posX += TetrisConfig.GridTileW * 0.5;
                    posY -= TetrisConfig.GridTileH * 0.5;
                }

                if (this._holdBlock.rotation !== 0){
                    this._holdBlock.turn(true, true);
                }

                this._holdBlock.setPosition(posX, posY);
                this._holdBlock.setFrozen(true);

                this.currentBlcok.setPosition(
                    TetrisConfig.GridTileW * (this._bornPos.col + 0.5),
                    TetrisConfig.GridTileH * (this._bornPos.row + 0.5)
                )
                this.currentBlcok.setFrozen(false);

                this._holdRelease = false;
            }
        }
    }

    private checkGameOver(){
        if (this.mainMatrix){
            let arr = this.mainMatrix[0];
            if (arr.indexOf(1) !== -1){
                this._gameOver = true;
                return true;
            }
        }

        return false;
    }
}
