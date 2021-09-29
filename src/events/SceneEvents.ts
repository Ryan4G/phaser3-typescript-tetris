const sceneEvents = new Phaser.Events.EventEmitter();

const EVENT_GAME_RESTART = Symbol('EVENT_GAME_RESTART');

export{
    sceneEvents,
    EVENT_GAME_RESTART
}