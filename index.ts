const request = require('request');
const readline = require('readline-sync');
const moment = require('moment');
const express = require('express');

function promiseRequest(url: string){
    return new Promise((resolve,reject) => {
        request(url, ( error, response, body) => {
            if ( error == null ) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function getNextBusesAtBusStop ( id : string, count?: number ): Promise<any> {
    //console.log(`id: ${id}`);
    const url = `https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`;
    return promiseRequest(url).then(
        (body: string) => {
            let jsonData = JSON.parse(body);
            //console.log(jsonData);
            jsonData.sort((left, right) => moment(left.expectedArrival).unix() - moment(right.expectedArrival).unix());
            //console.log(jsonData);
            if (count != undefined){
                jsonData = jsonData.slice(0,count)
            }
            return jsonData;
        },
        (error: string) => {
            console.log(error);
        }
        
    );
}

function printBusesFromPostcode(postcode: string){
    const url = `https://api.postcodes.io/postcodes/${postcode}`

    return promiseRequest ( url ).then (
        ( body: string ) => {
            let jsonData = JSON.parse(body);
            let longitude = jsonData.result.longitude;
            let latitude = jsonData.result.latitude;
            const radius = 200;
            const url = `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=${radius}&lat=${latitude}&lon=${longitude}`;
            promiseRequest ( url ).then (
                ( body: string ) => {
                    let busStops = JSON.parse(body).stopPoints;
                    busStops.sort((left,right)=>left.distance-right.distance);
                    let nearestBusStops = busStops.slice(0,2);

                    let allBusPromises = nearestBusStops.map((stopPointData) => getNextBusesAtBusStop(stopPointData.id, 5));
                    Promise.all(allBusPromises).then(nextBusesData => {
                        //console.log(firstTwo);
                        //console.log(nextBusesData);
                        for ( let i in nearestBusStops ) {
                            printBusTimes(nearestBusStops[i], nextBusesData[i]);
                        }
                    });
                },
                ( error: string ) => {
                    console.log(error);
                }
            )
        },
        ( error: string ) => {
            console.log(error);
        }
    );
}

function getBusesJSONFromPostcode(postcode: string){
    const url = `https://api.postcodes.io/postcodes/${postcode}`

    return promiseRequest( url ).then (
        ( body: string ) => {
            let jsonData = JSON.parse(body);
            let longitude = jsonData.result.longitude;
            let latitude = jsonData.result.latitude;
            const radius = 200;
            return `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=${radius}&lat=${latitude}&lon=${longitude}`;
        }, ()=>console.log('AAAAAAAAAAAAAAAAH')
    )
    .then(promiseRequest, ()=>console.log('AAAAAAAAH'))
    .then(handleStopPointsResponse, ()=>console.log('AAAAAAAAH'));
}

function handleStopPointsResponse(apiResponseBody) {
    let busStops = JSON.parse(apiResponseBody).stopPoints;
    busStops.sort((left, right) => left.distance - right.distance);
    let nearestBusStops = busStops.slice(0,2);

    let allBusPromises = nearestBusStops.map((stopPointData) => getNextBusesAtBusStop(stopPointData.id, 5));
    return Promise.all(allBusPromises).then(nextBusesData => {
        //console.log(firstTwo);
        //console.log(nextBusesData);
        let jsonData = [];
        for ( let i in nearestBusStops ) {
            // printBusTimes(nearestBusStops[i], nextBusesData[i]);
            jsonData.push({
                name: nearestBusStops[i].commonName,
                times: []
            });
            for ( let bus of nextBusesData[i] ) {
                jsonData[i].times.push(moment(bus.expectedArrival).format('HH:mm ddd'));
            }
        }
        return jsonData;
    });
}

function printBusTimes(busStop, busTimes) {
    console.log(`Buses at ${busStop.commonName}:`);
    for (let bus of busTimes) {
        console.log(`   ${moment(bus.expectedArrival).format('HH:mm ddd')}`);
    }
    console.log('');
}

function main() {
    // console.log("Enter a Postcode: ");
    // //const response = readline.prompt();
    // const response = 'NW51TL';
    // return getBusesJSONFromPostcode(response).then(
    //     jsonData => console.log(jsonData)
    // );
    
    const app = express();
    const port = 3000;

    app.get('/departureBoards', (req, res) => {
        let postcode = req.query.postcode;
        console.log(postcode);
        getBusesJSONFromPostcode ( postcode ).then ( res.json, ()=>console.log('AAAAAH') );
    } );

    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

main();
