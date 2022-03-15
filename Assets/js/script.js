// Global variables
const APIKey = "556c7224952ff69a1258be2c9abab777";


// Gets the coordinates of a given city and adds it to the list of saved cities
$('#search-button').on("click", event => {
    let city = $("#search-bar").val().toUpperCase();
    let requestUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+APIKey;

    let city_coords = fetch(requestUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("City name not found");
    }).then(data => {
        return data.coord
    }).then(coords => {
        localStorage.setItem("weather-dash:"+city, JSON.stringify(coords))
            $("#saved-cities").append($("<div>").addClass("accordion-collapse collapse show").attr("id","savedCitiesCollapse").attr("aria-labelledby","headingOne")
            .append($("<div>").addClass("accordion-body")
            .append($("<button>").addClass("cityButton").text(city)
            .on("click", event => {
                console.log(getCurrentCoordsWeather(coords));
            }))))
            return coords;
    }).catch((error) => {
        alert("City name provided was not found")
    })
})

// Function returns display required content as an object
function getCurrentCoordsWeather(coords) {
    console.log(coords);
    let requestUrls = "https://api.openweathermap.org/data/2.5/onecall?lat="+coords.lat+"&lon="+coords.lon+"&exclude=minutely,hourly,alerts&appid="+APIKey;

    fetch(requestUrls)
    .then(response => {
        console.log(response)
        return response.json()
    }).then(data => {
        console.log(data);
        return data;

        // current_weather.c_temp = data.current.temp;
        // current_weather.c_wind = data.current.wind_speed;
        // current_weather.c_humidity = data.current.humidity;
        // current_weather.c_uvi = data.current.uvi; UV index favoribility: 1-2/3-5/6-7/8-10-11+ 
    })
}

