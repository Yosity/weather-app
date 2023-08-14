import { useState, useEffect, useRef } from "react";
import "./App.css";

//Daytime weather icons
import clearD from "./assets/images/icons/clear.png";
//Night-time weather icons
import clearN from "./assets/images/icons/clear-night.png";

//common weather icon
import drizzle from "./assets/images/icons/drizzle.png";
import mist from "./assets/images/icons/mist.png";
import snow from "./assets/images/icons/snow.png";
import rain from "./assets/images/icons/rainy.png";
import cloudy from "./assets/images/icons/cloudy.png";
import thunderStorm from "./assets/images/icons/thunderstorm.png";
import noWeather from "./assets/images/icons/noWeather.png";

const apiKey = import.meta.env.VITE_API;

let weatherImg = "";
let sunsetTime = "";
let sunriseTime = "";
function App() {
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState(null); //holds the json data
  const weatherConditionRef = useRef(""); // Using useRef for weather condition

  //A function that determines the direction wind is blowing to
  function degreesToCardinal(degrees) {
    const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return cardinalDirections[index];
  }

  useEffect(() => {
    const searchIcon = document.querySelector(".search-icon");
    const searchBar = document.querySelector("#search-bar");

    function fetchWeatherData(city) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.cod === "404") {
            //city not found
            setCityName("City not found");
            if (!searchBar.classList.contains("notfound"))
              searchBar.classList.add("notfound");
            setWeatherData(null);
            weatherConditionRef.current = "";
          } else {
            //city found
            setWeatherData(data);
            setCityName(city);
            weatherConditionRef.current = data?.weather[0]?.main.toLowerCase();
            if (searchBar.classList.contains("notfound"))
              searchBar.classList.remove("notfound");
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }

    const handleSearch = () => {
      const city = searchBar.value.trim();
      if (city) {
        fetchWeatherData(city);
      }
    };

    //displays city info on pressing Enter
    searchBar.addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        handleSearch();
      }
    });

    searchIcon.addEventListener("click", handleSearch);

    return () => {
      searchBar.removeEventListener("keyup", handleSearch);
      searchIcon.removeEventListener("click", handleSearch);
    };
  }, [cityName]);
  let isNight = true;

  //Setting up  sunrise/sunset times of the current city
  if (weatherData) {
    let main = document.querySelector(".App");

    const currentDatetime = new Date(weatherData?.dt * 1000);
    const sunriseDate = new Date(weatherData?.sys?.sunrise * 1000);
    const sunsetDate = new Date(weatherData?.sys?.sunset * 1000);

    sunriseTime = sunriseDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sunsetTime = sunsetDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    //Checks wheather it's day or night time
    if (sunriseDate <= currentDatetime && currentDatetime <= sunsetDate) {
      isNight = false;
      if (!main.classList.contains("day")) main.classList.add("day");
      if (main.classList.contains("night")) main.classList.remove("night");
    } else {
      if (!main.classList.contains("night")) main.classList.add("night");
      if (main.classList.contains("day")) main.classList.remove("day");
    }
  }

  //assigning weather icon
  const weatherImages = {
    clouds: cloudy,
    clear: isNight ? clearN : clearD,
    snow: snow,
    rain: rain,
    drizzle: drizzle,
    thunderstorm: thunderStorm,
    mist: mist,
    default: noWeather,
  };
  weatherImg =
    weatherImages[weatherConditionRef.current] || weatherImages.default;
  return (
    <div className="App">
      <div className="main-container">
        <header className="search-bar-container">
          <input type="text" id="search-bar" placeholder="e.g New York" />
          <label htmlFor="search-bar">Please provide a correct city name</label>
          <button className="search-icon">
            <i className="fa-solid fa-magnifying-glass fa-rotate-90"></i>{" "}
          </button>
        </header>

        <main className="sub-container">
          <section className="weather-description">
            <div className="weather-img-container">
              <img src={weatherImg} alt="" />
            </div>
            <ul className="name-temperature-container">
              <li className="name">{cityName}</li>
              <li>
                <span className="temperature">
                  {Math.floor(weatherData?.main?.temp) || "-"}
                </span>
              </li>
              <li className="description">
                {weatherData?.weather[0]?.description}
              </li>
            </ul>
          </section>
          <section className="additional-info">
            <div className="info-row">
              <span className="humidity">
                <b>HUMIDITY</b>
                <p>{weatherData?.main?.humidity || "- "}%</p>
              </span>
              <span className="feels">
                <b>FEELS LIKE</b>
                <p>{Math.floor(weatherData?.main?.feels_like) || "-"}°</p>
              </span>
            </div>
            <div className="info-row">
              <span className="sunrise">
                <b>SUNRISE</b>
                <p>{weatherData ? sunriseTime : "-"}</p>
              </span>
              <span className="sunset">
                <b>SUNSET</b>
                <p>{weatherData ? sunsetTime : "-"}</p>
              </span>
            </div>

            <div className="info-row">
              <span className="wind-speed">
                <b>WIND</b>

                {weatherData?.wind ? (
                  <p>
                    {weatherData.wind.speed || "-"} <small>m/s</small> /&nbsp;
                    {degreesToCardinal(weatherData.wind.deg)}{" "}
                  </p>
                ) : (
                  "-"
                )}
              </span>
              <span className="pressure">
                <b>PRESSURE</b>
                <p>
                  {weatherData?.main?.pressure || "-"} <small>hPa</small>
                </p>
              </span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
