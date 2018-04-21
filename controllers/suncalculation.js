const calculation = require('calculation-ofsun');

module.exports = {
    sunPosition: getSunPosition,
    sunDeclination: getSunDeclination
};

function getSunInformation(date, lat, long) {
    var results = calculation.getSunInformation(date, lat, long);
    return results;
}

function getSunDeclination(date) {
    var JD = calculation.dateToJD(date);
    var results = calculation.declination(JD);
    return results;
}