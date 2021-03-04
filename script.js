$(document).ready(function() {

    let cityToSearch = ""

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
