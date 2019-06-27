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
        console.log(moment(bus.expectedArrival).format('HH:mm ddd'));
    }
}

function getNextBusesAtBusStop ( id : string ) {
    console.log(`id: ${id}`);
    const url = `https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`;
    return new Promise ((resolve, reject) => {
        console.log('promise started');
        request(url, ( error, response, body) => {
            console.log('request started');
            if ( error == null ) {
                let jsonData = JSON.parse(body);
                console.log(jsonData);
                jsonData.sort((left, right) => moment(left.expectedArrival).unix() - moment(right.expectedArrival).unix());
                console.log(jsonData);
                resolve ( jsonData );
            } else {
                reject ( error );
            }
        } );
    } );
}

function busesFromPostcode(error, response, body){
    let jsonData = JSON.parse(body);
    let longitude = jsonData.result.longitude;
    let latitude = jsonData.result.latitude;
    console.log(longitude);
    console.log(latitude);
    const radius = 200;
    const url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=${radius}&lat=${latitude}&lon=${longitude}`;
    return request ( url, function ( error, response, body) {
        //console.log(body);
        let stopPoints = JSON.parse(body).stopPoints;
        stopPoints.sort((left,right)=>left.distance-right.distance);
        let firstTwo = stopPoints.slice(0,2);

        let allBusPromises = firstTwo.map((stopPointData) => getNextBusesAtBusStop(stopPointData.id));
        Promise.all(allBusPromises)
            .then(nextBusesData => {
                console.log(firstTwo);
                console.log(nextBusesData);
                for ( let i in firstTwo ) {
                    console.log(`Buses at ${firstTwo[i].commonName}:`);
                    for ( let bus of nextBusesData[i] ) {
                        console.log(`   ${moment(bus.expectedArrival).format('HH:mm ddd')}`);
                    }
                    console.log('');
                }
            })
    } );
}

function main() {
    console.log("Enter a Postcode: ");
    //const response = readline.prompt();
    const response = 'NW51TL';
    const url = `https://api.postcodes.io/postcodes/${response}`
    request(url, busesFromPostcode)
    // console.log('Enter a stop code');
    // //const response = readline.prompt();
    // const response = '490008660N';
    // const url = `https://api.tfl.gov.uk/StopPoint/${response}/Arrivals`;
    // request(url, displayNextBuses );
}



main();