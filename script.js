$(document).ready(function() {
    let cityToSearch = "";
    let apikey = "a8399274d821a66647513527414df9b0";
    let currentEndpoint = "https://api.openweathermap.org/data/2.5/weather?q=";
    let fiveDayEndpoint = "https://api.openweathermap.org/data/2.5/onecall?";
    let recentSearches = [];
    // check if there are recent searches in local storage and display them
    if (localStorage.getItem('recentSearches')) {
        console.log('found stored searches');
        recentSearches = JSON.parse(localStorage.getItem('recentSearches'));
        displayRecents();
        // get weather for last called city
        currentWeatherCall($("#recent-searches li").last().text())
    }
    // add event listener to submit city search button
    $("#submit").on("click", function(event) {
        event.preventDefault();
        currentWeatherCall($("#city-search-field").val());
    });
    // add event listener to recents
    $("#recent-searches").on('click', function(event) {
        let city = $(event.target).text();
        currentWeatherCall(city);
    })
    function currentWeatherCall(city) {
        cityToSearch = city.toLowerCase();
        let url = `${currentEndpoint}${cityToSearch}&appid=${apikey}`;
        fetch(url)
        .then((res) => {
           console.log(res);
           if (res.status == 404) {
             console.log('NOPE');
             $("#err").show();
             return;
           }
           $("#err").hide();
           jsonRes = res.json();
           return jsonRes;
         })
        .then((jsonRes) => {
          displayCurrent(jsonRes);
          saveToRecent(city);
          displayRecents();
          const lat = jsonRes.coord.lat;
          const lon = jsonRes.coord.lon;
          fiveDayWeatherCall(lat, lon);
        })
    }
    function formatDate(dateCode) {
        dateString = "";
        dateObj = new Date(dateCode * 1000);
        let month = (dateObj.getMonth() + 1).toString();
        let date = dateObj.getDate().toString();
        if (month.length == 1) {
            month = '0' + month;
        }
        if (date.length == 1) {
            date = '0' + date;
        }
        dateString += `${month} / ${date}`;
        return dateString;
    }
    function getIconUrl(iconCode) {
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        return iconUrl;
    }
    function displayCurrent(data) {
        let humidity = data.main.humidity;
        let temp = convertTemp(data.main.temp);
        let iconCode = data.weather[0].icon;
        let iconUrl = getIconUrl(iconCode);
        let cityName = data.name;
        $("#current .name").text(' in ' + cityName + ': ');
        //$("#current .tempSpan").html(temp.toFixed(2) + ' &deg;C');
        $("#current .tempSpan").html(temp);
        /* $("#minSpan").html(tempMin.toFixed(2) + ' &deg;C');
        $("#maxSpan").html(tempMax.toFixed(2) + ' &deg;C'); */
        $("#current img").attr("src", iconUrl);
        $("#weather-figure").show();
        $("#current .humidSpan").text(humidity + "%");
    }
    function saveToRecent(city) {
        if (recentSearches.indexOf(city) != -1) {
          console.log('same as last one');
          return;
        }
        recentSearches.push(city);
        if (recentSearches.length > 5) {
            recentSearches.shift();
        }
        let recentSearchesString = JSON.stringify(recentSearches)
        localStorage.setItem('recentSearches', recentSearchesString);
    }
    function displayRecents() {
        $("#recent-searches").empty();
        recentSearches.forEach(city => {
            let newEl = $("<li>");
            newEl.text(city);
            newEl.addClass("recent-search")
            $("#recent-searches").append(newEl);
        })
    }
    function fiveDayWeatherCall(lat, lon) {
        let url = `${fiveDayEndpoint}lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${apikey}`;
        fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((jsonRes) => {
          displayFiveDay(jsonRes);
          const uvIndex = jsonRes.daily[0].uvi;
          $("#current .uvSpan").text(uvIndex);
        })
    }
    function displayFiveDay(data) {
        $("#fiveday").empty();
        for (let i = 0; i < 5; i++) {
            let day = data.daily[i];
            let dateCode = day.dt;
            let humidity = day.humidity;
            let temp = day.temp.day;
            let temp_max = convertTemp(day.temp.max);
            let temp_min = convertTemp(day.temp.min);
            let weather = day.weather[0].main;
            let iconUrl = getIconUrl(day.weather[0].icon);
            let dayCard = $("<div>").addClass("card day-card");
            dayCard.append( $("<h4>").addClass("date").text(formatDate(dateCode)) );
            dayCard.append( $("<figure>").addClass("daily-icon").append( $("<img>").attr("src", iconUrl) ) );
            let dayInfo = $("<div>").addClass("day-info");
            dayInfo.append( $("<p>").addClass("card-text").text("weather: " + weather) );
            dayInfo.append( $("<p>").addClass("card-text").text("min: " + temp_min) );
            dayInfo.append( $("<p>").addClass("card-text").text("max: " + temp_max) );
            dayCard.append(dayInfo);
            $("#fiveday").append(dayCard);
        }
    }
    function convertTemp(temp) {
        temp = (temp - 273.15).toFixed(2);
        temp += ' °C'
        return temp;
    }
});