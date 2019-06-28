function onSubmit(){
    var xhttp = new XMLHttpRequest();
 
    xhttp.open('GET', 'http://localhost:3000/departureBoards?postcode=nw51tl', true);
    
    xhttp.setRequestHeader('Content-Type', 'application/json');
    
    xhttp.onload = function() {
        // Handle response here using e.g. xhttp.status, xhttp.response, xhttp.responseText
        let json = JSON.parse(xhttp.response)

        // document.getElementById("results").innerHTML = `<h2>Results</h2>
        // <h3>${json[0].name}</h3>
        // <ul>
        //     <li>2 minutes: 123 to Example Street</li>
        //     <li>3 minutes: 456 to Fantasy Land</li>
        // </ul>
        // <h3>Example stop 2</h3>
        // <ul>
        //     <li>1 minute: 123 to Example Street</li>
        //     <li>4 minutes: 456 to Fantasy Land</li>
        // </ul>`

        let string = "<h2>Results</h2> \n"
        for (let stop of json){
            string += `<h3>${stop.name}</h3>`
            string += "\n<ul>\n"
            for (let time of stop.times){
                string += `<li>${time}</li>`
                string += "\n"
            }
            string += "</ul>\n"
        }

        document.getElementById("results").innerHTML = string



    
    }
    
    xhttp.send();
}
