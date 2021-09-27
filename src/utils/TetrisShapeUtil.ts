import { TetrisConfig } from "../configs/TetrisConfig";
import { TetrisShapes } from "../enums/TetrisShapes";
import { IPosition } from "../interfaces/IPosition";

const makeTetrisShape = (shape: TetrisShapes) => {
    let posArr: Array<IPosition> = [];
    let tileW = TetrisConfig.GridTileW;
    let tileH = TetrisConfig.GridTileH;

    switch(shape){
        case TetrisShapes.BlueRicky:{
            posArr.push({x:-tileW, y:-tileH});
            posArr.push({x:-tileW, y:0});
            posArr.push({x:0, y:0});
            posArr.push({x:tileW, y:0});
            break;
        }
        case TetrisShapes.OrangeRicky:{
            posArr.push({x:tileW, y:-tileH});
            posArr.push({x:-tileW, y:0});
            posArr.push({x:0, y:0});
            posArr.push({x:tileW, y:0});
            break;
        }
        case TetrisShapes.ClevelandZ:{
            posArr.push({x:-tileW, y:-tileH});
            posArr.push({x:0, y:-tileH});
            posArr.push({x:0, y:0});
            posArr.push({x:tileW, y:0});
            break;
        }
        case TetrisShapes.RhodeIslandZ:{
            posArr.push({x:tileW, y:-tileH});
            posArr.push({x:0, y:-tileH});
            posArr.push({x:0, y:0});
            posArr.push({x:-tileW, y:0});
            break;
        }
        case TetrisShapes.Teewee:{
            posArr.push({x:0, y:-tileH});
            posArr.push({x:-tileW, y:0});
            posArr.push({x:0, y:0});
            posArr.push({x:tileW, y:0});
            break;
        }
        case TetrisShapes.SmashBoy:{
            posArr.push({x:-tileW, y:-tileH});
            posArr.push({x:-tileW, y:0});
            posArr.push({x:0, y:-tileH});
            posArr.push({x:0, y:0});
            break;
        }
        case TetrisShapes.Hero:{
            posArr.push({x:-tileW * 2, y:0});
            posArr.push({x:-tileW, y:0});
            posArr.push({x:0, y:0});
            posArr.push({x:tileW, y:0});
            break;
        }
        default:{
            break;
        }
    }

    return posArr;
};

export {
    makeTetrisShape
}