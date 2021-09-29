import { TetrisShapes } from "../enums/TetrisShapes";

const getTetrisBlockLineGraphics = (shape: TetrisShapes) => {
    let lineGraphic:Phaser.Types.GameObjects.Graphics.LineStyle;
    switch(shape){
        case TetrisShapes.OrangeRicky:{
            lineGraphic = {
                color: 0x744300,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.BlueRicky:{
            lineGraphic = {
                color: 0x003374,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.ClevelandZ:{
            lineGraphic = {
                color: 0x740000,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.RhodeIslandZ:{
            lineGraphic = {
                color: 0x007F23,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.Teewee:{
            lineGraphic = {
                color: 0x7E3394,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.SmashBoy:{
            lineGraphic = {
                color: 0x746600,
                alpha: 0.6
            };
            break;
        }
        case TetrisShapes.Hero:{
            lineGraphic = {
                color: 0x00727F,
                alpha: 0.6
            };
            break;
        }
    }

    return lineGraphic;
};

const getTetrisBlockFillGraphics = (shape: TetrisShapes) => {
    let fillGraphic:Phaser.Types.GameObjects.Graphics.FillStyle;
    switch(shape){
        case TetrisShapes.OrangeRicky:{
            fillGraphic = {
                color: 0xEDA400
            };
            break;
        }
        case TetrisShapes.BlueRicky:{
            fillGraphic = {
                color: 0x0081E8
            };
            break;
        }
        case TetrisShapes.ClevelandZ:{
            fillGraphic = {
                color: 0xE70000
            };
            break;
        }
        case TetrisShapes.RhodeIslandZ:{
            fillGraphic = {
                color: 0x00E155
            };
            break;
        }
        case TetrisShapes.Teewee:{
            fillGraphic = {
                color: 0xCB00F2
            };
            break;
        }
        case TetrisShapes.SmashBoy:{
            fillGraphic = {
                color: 0xE9D200
            };
            break;
        }
        case TetrisShapes.Hero:{
            fillGraphic = {
                color: 0x00C3DC
            };
            break;
        }
    }
    return fillGraphic;
};

export{
    getTetrisBlockLineGraphics,
    getTetrisBlockFillGraphics
}