// Global variables
const APIKey = "556c7224952ff69a1258be2c9abab777";

// Function returns display required content as an object
function getCurrentCoordsWeather(coords, event=null, city=null) {
    let requestUrls = "https://api.openweathermap.org/data/2.5/onecall?lat="+coords.lat+"&lon="+coords.lon+"&exclude=minutely,hourly,alerts&units=imperial&appid="+APIKey;
    let current_day = moment();    // ^ Set up request to fetch a location based on given coords. Exclude minute/hour forecasts or alerts and pull in via imperial system
    
    fetch(requestUrls)
    .then(response => {
        return response.json()
    }).then(data => {
        let uviSeverity = data.current.uvi;
        
        if (uviSeverity <= 2) {
            uviSeverity = "uvi uvi-low";
        } else if (uviSeverity > 2 && uviSeverity <= 5) {
            uviSeverity = "uvi uvi-moderate";
        } else if (uviSeverity > 5 && uviSeverity <= 7) {    // change class will for the uvi index depending on where it falls in the range
            uviSeverity = "uvi uvi-high";
        } else if (uviSeverity > 7 && uviSeverity <= 10) {   // chart of severity found on https://www.epa.gov/sunsafety/uv-index-scale-0
            uviSeverity = "uvi uvi-very-high"
        } else {
            uviSeverity = "uvi uvi-extreme"
        }
        
        if (event !== null) {
            $("#city-name").text(event.target.innerHTML+" "+current_day.format("(M/D/YYYY)"))    // input handler determines if event or city string was passed in
            .append($("<img>").attr("src", "http://openweathermap.org/img/wn/"+data.current.weather[0].icon+"\@2x.png"))
        } else if (city !== null) {
            $("#city-name").text(city+" "+current_day.format("(M/D/YYYY)"))
            .append($("<img>").attr("src", "http://openweathermap.org/img/wn/"+data.current.weather[0].icon+"\@2x.png"))
        }

        $("#display-temp").text(data.current.temp+"℉")
        $("#display-wind_speed").text(data.current.wind_speed+" MPH")      // Display information for current day to the html
        $("#display-humidity").text(data.current.humidity+"%")
        $("#display-uvi").addClass(uviSeverity).text(data.current.uvi)

        $("#forecast-list").children().remove()    // Remove the forecast cards that may currently be present
        for (index = 0; index < 5; index++) {
            let indexed_day = data.daily[index];
            let data_icon = "http://openweathermap.org/img/wn/"+data.daily[index].weather[0].icon+"\@2x.png"  // api data grabs link to appropriate weather icon for each day.

            $("#forecast-list").append($("<div>").addClass("card col mx-2").append($("<h5>").text(current_day.add(1, "days").format("M/D/YYYY")))
            .append($("<img>").attr("src", data_icon).attr("alt", "Weather Condition Icon"))
            .append($("<div>").addClass("card-body")
            .append($("<div>").addClass("row my-2").text("Temp: "+indexed_day.temp.day+"℉"))        // Set up card for each day being looped through
            .append($("<div>").addClass("row my-2").text("Wind: "+indexed_day.wind_speed+" MPH"))
            .append($("<div>").addClass("row my-2").text("Humidity: "+indexed_day.humidity+"%"))                
            ))
        }
    })
}

$("#search-bar").val(""); // Clear search bar text upon load
// Get saved cities from local storage and put them into dashboard first
if (localStorage.length > 0) {
    for (index = 0; index < localStorage.length; index++) {
        if(localStorage.key(index).includes("weather-dash")) {
            let coords = JSON.parse(localStorage.getItem(localStorage.key(index)))
            let city_name = localStorage.key(index).substring(localStorage.key(index).indexOf(":")+1) // gets city name from substring of key using the ":" character

            $("#saved-cities").append($("<div>").addClass("accordion-collapse collapse show").attr("id","savedCitiesCollapse").attr("aria-labelledby","headingOne")
            .append($("<div>").addClass("accordion-body")
            .append($("<button>").addClass("cityButton").text(city_name)  // Adds city list based on data pulled from local storage
            .on("click", event => {
                getCurrentCoordsWeather(coords, null, city_name)
            }))))
            getCurrentCoordsWeather(coords, null, city_name) // Call the function to display immediately after the city is added
        }
    }
}


// Gets the coordinates of a given city and adds it to the list of saved cities
$('#search-button').on("click", event => {
    let city = $("#search-bar").val().toUpperCase();
    let requestUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+APIKey;  // uses search bar's content to create request for that city

    fetch(requestUrl)
    .then(response => {
        if (!response.ok) {  // If response comes back rejected, then given city is not found
            throw new Error("city not found")
        } else if (localStorage.getItem("weather-dash:"+city) !== null){  // Also check if city entered already exists in local storage
            throw new Error("city exists")                                // If it does then cancel out. City should already be added by handler above
        }
        $("#search-bar").val("");  // Reset content of search bar after successful search
        return response.json()
    }).then(data => {
        return data.coord
    }).then(coords => {
        localStorage.setItem("weather-dash:"+city, JSON.stringify(coords))
            $("#saved-cities").append($("<div>").addClass("accordion-collapse collapse show").attr("id","savedCitiesCollapse").attr("aria-labelledby","headingOne")
            .append($("<div>").addClass("accordion-body")
            .append($("<button>").addClass("cityButton").text(city)  // Adds city to list based on data pulled from api
            .on("click", event => {
                getCurrentCoordsWeather(coords, event)
            }))))
            getCurrentCoordsWeather(coords, null, city)  // Call the function to display immediately after the city is added
    }).catch((e) => {
        if (e.message === "city not found") { alert("City was not found") }    // Alert user that city was not found
        else if (e.message === "city exists") { alert("City already saved") }  // Alert user that city already saved
    })
})