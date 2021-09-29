import Phaser from 'phaser';
import { TetrisConfig } from '../configs/TetrisConfig';
import OptionsUIScene from './OptionsUIScene';

export default class PauseUIScene extends Phaser.Scene {

    constructor() {
        super('PauseUIScene');
    }

    create()
    {
        this.input.addPointer(1);
        
        this.cameras.main.setBounds(- this.scale.width * 0.25 - TetrisConfig.GridTileW, -TetrisConfig.GridTileH * 6, this.scale.width, this.scale.height);
        
        const pauseUIGraphic = this.add.graphics(
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

        const pauseUIRect  = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 2,
            TetrisConfig.GridTileH * 2,
            TetrisConfig.GridTileW * 6,
            TetrisConfig.GridTileH * 8
        );

        const pauseStatusText = this.add.text(
            pauseUIRect.x + pauseUIRect.width * 0.5,
            pauseUIRect.y + TetrisConfig.GridTileH,
            'PAUSED',
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

        const resumeRect = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 3,
            TetrisConfig.GridTileH * 7,
            TetrisConfig.GridTileW * 4,
            TetrisConfig.GridTileH * 2
        );
        const resumeText = this.add.text(
            resumeRect.x + resumeRect.width * 0.5,
            resumeRect.y + resumeRect.height * 0.5,
            'RESUME',
            {
                color: '#000',
                fontSize: '1.6em',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        pauseUIGraphic.fillRoundedRect(pauseUIRect.x, pauseUIRect.y, pauseUIRect.width, pauseUIRect.height);

        pauseUIGraphic.strokeRoundedRect(controlRect.x, controlRect.y, controlRect.width, controlRect.height);
        pauseUIGraphic.fillRoundedRect(controlRect.x, controlRect.y, controlRect.width, controlRect.height);

        pauseUIGraphic.strokeRoundedRect(resumeRect.x, resumeRect.y, resumeRect.width, resumeRect.height);
        pauseUIGraphic.fillRoundedRect(resumeRect.x, resumeRect.y, resumeRect.width, resumeRect.height);

        controlText.setInteractive();
        controlText.on(
            Phaser.Input.Events.POINTER_UP,
            ()=>{
                //console.log('switch to optionsui')
                this.scene.switch('OptionsUIScene');
                const scene = this.scene.get('OptionsUIScene') as OptionsUIScene;
                scene.setBackScene(this.scene.key);
            }
        );

        resumeText.setInteractive();
        resumeText.on(
            Phaser.Input.Events.POINTER_UP,
            ()=>{
                //console.log('switch to gamescene')
                this.scene.resume('GameScene');
                this.scene.stop();
            }
        );
    }

    update() {

    }
}
