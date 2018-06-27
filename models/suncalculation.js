const calculation = require('calculation-ofsun');

module.exports = {
    sunInformation: getSunInformation
};

/**
 * Calculate the sun
 * @param {Date} date Date for calculation the sun's position
 * @param {number} lat Location latitude for observer
 * @param {number} long Location longitude for observer
 */
function getSunInformation(date, lat, long) {
    var results = calculation.getSunInformation(date, lat, long);
    results.sun_position.altitude = (results.sun_position.altitude + "").substring(0, 10);
    return results;
}