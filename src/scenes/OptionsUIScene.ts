import Phaser from 'phaser';
import { getBrowserMobileMode } from '../utils/Mobile';
import { TetrisConfig } from '../configs/TetrisConfig';

export default class OptionsUIScene extends Phaser.Scene {

    constructor() {
        super('OptionsUIScene');
    }

    create()
    {
        this.input.addPointer(1);

        this.cameras.main.setBounds(-TetrisConfig.GridTileW * 2, - TetrisConfig.GridTileW, this.scale.width, this.scale.height);
        
        const optionsUIGraphic = this.add.graphics(
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

        const optionsUIRect  = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 2,
            TetrisConfig.GridTileH * 2,
            TetrisConfig.GridTileW * 16,
            TetrisConfig.GridTileH * 18
        );

        const operationTitle = this.add.text(
            optionsUIRect.x + optionsUIRect.width * 0.5,
            TetrisConfig.GridTileH * 3.5,
            'Control Options',
            {
                fontSize: '3em',
                fontStyle: 'bolder',
                color: '#000'
            }
        ).setOrigin(0.5);

        const operationText = this.add.text(
            optionsUIRect.x + optionsUIRect.width * 0.3,
            TetrisConfig.GridTileH * 11,
            `
            Rotate Right : UP(↑)   \n
            Rotate Left  : Z       \n
            Hard Drop    : SPACE   \n
            Soft Drop    : DOWN(↓) \n
            Hold Block   : C       \n
            Move Left    : LEFT(←) \n
            Move Right   : RIGHT(→)`,
            {
                fontSize: '2em',
                fontStyle: 'bolder',
                color: '#000'
            }
        ).setOrigin(0.5);

        const splitLine = new Phaser.Geom.Line(
            TetrisConfig.GridTileW * 2,
            TetrisConfig.GridTileH * 5,
            TetrisConfig.GridTileW * 18,
            TetrisConfig.GridTileH * 5,
        )

        const okRect = new Phaser.Geom.Rectangle(
            TetrisConfig.GridTileW * 8.5,
            optionsUIRect.height - TetrisConfig.GridTileH * 0.5,
            TetrisConfig.GridTileW * 3,
            TetrisConfig.GridTileH * 1.5
        );

        const okText = this.add.text(
            okRect.x + okRect.width * 0.5,
            okRect.y + okRect.height * 0.5,
            'DONE',
            {
                fontSize: '2em',
                fontStyle: 'bolder',
                color: '#000'
            }
        ).setOrigin(0.5);

        optionsUIGraphic.strokeRoundedRect(optionsUIRect.x, optionsUIRect.y, optionsUIRect.width, optionsUIRect.height);
        optionsUIGraphic.fillRoundedRect(optionsUIRect.x, optionsUIRect.y, optionsUIRect.width, optionsUIRect.height);
        optionsUIGraphic.strokeLineShape(splitLine);
        optionsUIGraphic.strokeRoundedRect(okRect.x, okRect.y, okRect.width, okRect.height, 10);
        const okBtn = optionsUIGraphic.fillRoundedRect(okRect.x, okRect.y, okRect.width, okRect.height, 10);

        okText.setInteractive();
        okText.on(
            Phaser.Input.Events.POINTER_UP,
            ()=>{
                console.log('switch to pauseui')
                this.scene.switch('PauseUIScene');
            }
        );

        const mobileMode = getBrowserMobileMode();

        if (mobileMode){
            operationText.setText(
            `
            Rotate Right : ROTATE  \n
            Hard Drop    : HARD    \n
            Soft Drop    : DOWN    \n
            Hold Block   : HOLD    \n
            Move Left    : LEFT    \n
            Move Right   : RIGHT`
            );
        }
    }

    update() {

    }
}
