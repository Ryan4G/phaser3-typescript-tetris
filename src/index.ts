import Phaser from 'phaser';

import GameScene from './scenes/GameScene'
import PreloadScene from './scenes/PreloadScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 600,
	height: 600,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	scene: [PreloadScene, GameScene]
}

export default new Phaser.Game(config)
