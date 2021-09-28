import Phaser from 'phaser';
import OptionsUIScene from './scenes/OptionsUIScene';

import GameScene from './scenes/GameScene'
import PreloadScene from './scenes/PreloadScene'
import PauseUIScene from '~scenes/PauseUIScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	scene: [PreloadScene, GameScene, PauseUIScene, OptionsUIScene]
}

export default new Phaser.Game(config)
