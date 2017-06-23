var _ = require('lodash'),
    utils = require('../../../utils'),
    driver = utils.getDriver(),
    C = driver.constants;

module.exports = function(intent, roomObjects, roomTerrain, bulk, bulkUsers, roomController) {

    var object = roomObjects[intent.id];

    if(!object || !C.CONSTRUCTION_COST[object.type]) return;

    if(!roomController || roomController.user != intent.user) return;

    if(object.type == C.STRUCTURE_WALL && object.decayTime && !object.user) return;

    if(_.any(roomObjects, i => i.type == 'creep' && i.user != intent.user)) return;

    bulk.remove(object._id, object.room);

    if(object.type == 'spawn' && object.spawning) {
        var spawning = _.find(roomObjects, {user: object.user, name: object.spawning.name});
        if(spawning) {
            bulk.remove(spawning._id, spawning.room);
        }
    }

    C.RESOURCES_ALL.forEach(resourceType => {
        if (object[resourceType] > 0) {
            require('../creeps/_create-energy')(object.x, object.y, object.room,
            object[resourceType], roomObjects, bulk, resourceType);
        }
    });

    if(object.type == 'constructedWall' && object.decayTime && object.user) {
        require('../creeps/_clear-newbie-walls')(roomObjects, bulk);
    }

};