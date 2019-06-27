const request = require('request');
const readline = require('readline-sync');
const moment = require('moment');

function displayNextBuses(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    let jsonData = JSON.parse(body);
    
    jsonData.sort((left, right) => moment(left.expectedArrival).unix() - moment(right.expectedArrival).unix());
    jsonData = jsonData.slice(0,5);
    for ( let bus of jsonData ) {
        console.log(bus.expectedArrival);
    }
}

function main() {
    console.log('Enter a stop code');
    const response = readline.prompt();
    const url = `https://api.tfl.gov.uk/StopPoint/${response}/Arrivals`;
    request(url, displayNextBuses );
}

main();