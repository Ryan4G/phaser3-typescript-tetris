import Phaser from 'phaser';
import OptionsUIScene from './scenes/OptionsUIScene';

import GameScene from './scenes/GameScene'
import PreloadScene from './scenes/PreloadScene'
import PauseUIScene from './scenes/PauseUIScene';
import GameOverUIScene from './scenes/GameOverUIScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: '#phaser-main',
		mode: Phaser.Scale.FIT,
		width: 576,
		height: 576
	},
	width: 576,
	height: 576,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	scene: [PreloadScene, GameScene, PauseUIScene, OptionsUIScene, GameOverUIScene]
}

export default new Phaser.Game(config)
