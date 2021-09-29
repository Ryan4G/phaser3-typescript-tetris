import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

	preload(){
		this.load.audio('bgm', 'assets/sounds/bgm.mp3');
		this.load.audio('hardDrop', 'assets/sounds/hardDrop.mp3');
		this.load.audio('move', 'assets/sounds/move.mp3');
		this.load.audio('rotate', 'assets/sounds/rotate.mp3');
		this.load.audio('lock', 'assets/sounds/lock.mp3');
		this.load.audio('hold', 'assets/sounds/hold.mp3');
		this.load.audio('levelUp', 'assets/sounds/levelUp.mp3');
		this.load.audio('gameOver', 'assets/sounds/gameOver.mp3');
	}

    create()
    {
		this.scene.start('GameScene');
    }

    update() {

    }
}
