import { TetrisConfig } from "~configs/TetrisConfig";

export default class LayerTetris extends Phaser.GameObjects.Container{
   
    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world. Default 0.
     * @param y The vertical position of this Game Object in the world. Default 0.
     * @param children An optional array of Game Objects to add to this Container.
     */
     constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[]){
        super(scene, x, y, children);

        const rect = this.scene.add.rectangle(0, 0, TetrisConfig.GridTileW, TetrisConfig.GridTileH, 0x00ff00);
        this.add(rect);
    }
}