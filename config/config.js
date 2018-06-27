/*
    This config file is to keep any usefull resource for the project
    Author: Robby Muhammad Nst a.k.a OrionStark
*/
module.exports = {
    neo_url: neoUrl,
    saltRounds: 10,
    secret_key: "yggdrasil3422",
    neo_url: neoUrl,
    formatMyDateToNASARequiredDate: getDateFormat
};



const nasa_api_key = "kR5WRl2oeCmgphetTODr4pLlxR8NsyjR7ceoTUVl";

/**
 * Get neo url by entering start_date and end_date
 * @param {Date} start_date
 * @param {Date} end_date
 * @return {string} NEO URL 
 */
function neoUrl(start_date, end_date) {
    if ( typeof start_date === "string" ) {
        start_date = new Date(start_date);
    }
    if ( typeof end_date === "string" ) {
        end_date = new Date(end_date);
    }
    start_date = getDateFormat(start_date);
    end_date = getDateFormat(end_date);
    let url = "https://api.nasa.gov/neo/rest/v1/feed?start_date="+ start_date 
                +"&end_date="+ end_date +"&api_key=" + nasa_api_key;
    return url;
}

/**
 * NASA required yyyy-mm-dd format to make a request
 * @param {Date} date 
 * @returns {string} Date format
 */
function getDateFormat(date) {
    let month = '' + ( date.getMonth() + 1 );
    let day = '' + date.getDate();
    const year = '' + date.getFullYear();
    if ( month.length < 2 ) {
      month = '0' + month;
    }
    if ( day.length < 2 ) {
      day = '0' + day;
    }

    return [ year, month, day ].join('-');
}