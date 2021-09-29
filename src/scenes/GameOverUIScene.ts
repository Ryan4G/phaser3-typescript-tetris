import Phaser from 'phaser';
import { EVENT_GAME_RESTART, sceneEvents } from '../events/SceneEvents';
import { TetrisConfig } from '../configs/TetrisConfig';
import GameScene from './GameScene';

export default class GameOverUIScene extends Phaser.Scene {

    constructor() {
        super('GameOverUIScene');
    }

    create()
    {
        this.input.addPointer(1);
        
        this.cameras.main.setBounds(- this.scale.width * 0.25 - TetrisConfig.GridTileW, -TetrisConfig.GridTileH * 6, this.scale.width, this.scale.height);
        
        const gameOverUIGraphic = this.add.graphics(
            {
                lineStyle: {
                    width: 2,
                    color: 0x000000,
                    alpha: 1
                },
                fillStyle: {
                    color: 0xffffff
                }
            }
        );

        const gameOverUIRect  = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 2,
            TetrisConfig.GridTileH * 2,
            TetrisConfig.GridTileW * 6,
            TetrisConfig.GridTileH * 8
        );

        const pauseStatusText = this.add.text(
            gameOverUIRect.x + gameOverUIRect.width * 0.5,
            gameOverUIRect.y + TetrisConfig.GridTileH,
            'GAME OVER',
            {
                color: '#000',
                fontSize: '2em',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const controlRect = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 3,
            TetrisConfig.GridTileH * 4,
            TetrisConfig.GridTileW * 4,
            TetrisConfig.GridTileH * 2
        );
        const controlText = this.add.text(
            controlRect.x + controlRect.width * 0.5,
            controlRect.y + controlRect.height * 0.5,
            'CONTROLS',
            {
                color: '#000',
                fontSize: '1.6em',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const restartRect = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 3,
            TetrisConfig.GridTileH * 7,
            TetrisConfig.GridTileW * 4,
            TetrisConfig.GridTileH * 2
        );
        const restartText = this.add.text(
            restartRect.x + restartRect.width * 0.5,
            restartRect.y + restartRect.height * 0.5,
            'RESTART',
            {
                color: '#000',
                fontSize: '1.6em',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        gameOverUIGraphic.fillRoundedRect(gameOverUIRect.x, gameOverUIRect.y, gameOverUIRect.width, gameOverUIRect.height);

        gameOverUIGraphic.strokeRoundedRect(controlRect.x, controlRect.y, controlRect.width, controlRect.height);
        gameOverUIGraphic.fillRoundedRect(controlRect.x, controlRect.y, controlRect.width, controlRect.height);

        gameOverUIGraphic.strokeRoundedRect(restartRect.x, restartRect.y, restartRect.width, restartRect.height);
        gameOverUIGraphic.fillRoundedRect(restartRect.x, restartRect.y, restartRect.width, restartRect.height);

        controlText.setInteractive();
        controlText.on(
            Phaser.Input.Events.POINTER_UP,
            ()=>{
                console.log('switch to optionsui')
                this.scene.switch('OptionsUIScene');
            }
        );

        restartText.setInteractive();
        restartText.on(
            Phaser.Input.Events.POINTER_UP,
            ()=>{
                sceneEvents.emit(EVENT_GAME_RESTART);
                this.scene.stop();
            }
        );

        this.sound.play('gameOver');
    }

    update() {

    }
}
