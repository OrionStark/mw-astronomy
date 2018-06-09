const axios = require('axios');
const q = require('q');
const config = require('../config/config');

module.exports = {
    todayNeo: getTodayNeo,
    neoByDate: getNeobyDate
};

function getTodayNeo() {
    let start_date = new Date();
    let end_date = new Date();
    let holdPromise = q.defer();
    axios.get(config.neo_url(start_date, end_date))
        .then(
            (res) => {
                // NASA give the data with a properties named by the date. Hahahah. It's so confusing
                let date = config.formatMyDateToNASARequiredDate(new Date());
                let data = {
                    element_count: res.data.element_count,
                    near_earth_objects: res.data.near_earth_objects[date]
                }
                holdPromise.resolve(data);
            }
        )
        .catch(
            (err) => {
                holdPromise.resolve({
                    status: false,
                    message: "We got an error on get your data. It may caused by network connection."
                });
            }
        );
    return holdPromise.promise;
}

function getNeobyDate(start_date, end_date) {
    let holdPromise = q.defer();
    axios.get(config.neo_url(start_date, end_date))
        .then(
            (res) => {
                holdPromise.resolve(res.data);
            }
        )
        .catch(
            (err) => {
                holdPromise.resolve({
                    status: false,
                    message: "We got an error on get your data. It may caused by network connection."
                });
            }
        )
    return holdPromise.promise;
}