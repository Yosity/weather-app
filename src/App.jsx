import { useState, useEffect, useRef } from "react";
import "./App.css";

//Daytime weather icons
import clearD from "./assets/images/clear.png";
//Night-time weather icons
import clearN from "./assets/images/clear-night.png";

import drizzle from "./assets/images/drizzle.png";
import mist from "./assets/images/mist.png";
import snow from "./assets/images/snow.png";
import rain from "./assets/images/rainy.png";
import cloudy from "./assets/images/cloudy.png";
import thunderStorm from "./assets/images/thunderstorm.png";
import noWeather from "./assets/images/noWeather.png";

const apiKey = import.meta.env.VITE_API_KEY; // import env key - create .env file in root of project

let sunsetTime = "";
let sunriseTime = "";
let currenTime = "";

function App() {
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const weatherConditionRef = useRef("");

  function degreesToCardinal(degrees) {
    const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return cardinalDirections[index];
  }

  useEffect(() => {
    const searchIcon = document.querySelector(".search-icon");
    const searchBar = document.querySelector("#search-input");

    function fetchWeatherData(city) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.cod === "404") {
            setCityName("City not found");
            searchBar.classList.toggle("notfound", true);
            setWeatherData(null);
            weatherConditionRef.current = "";
          } else {
            setWeatherData(data);
            setCityName(city);
            weatherConditionRef.current = data?.weather[0]?.main.toLowerCase();
            searchBar.classList.toggle("notfound", false); //  toggle instead add,remove
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
        searchBar.value = ""; // clear input after submit
      }
    };

    searchBar.addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        handleSearch();
        searchBar.value = ""; // clear input after submit
      }
    });

    searchIcon.addEventListener("click", handleSearch);

    /*   return () => {
      searchBar.removeEventListener("keyup", handleSearch);
      searchIcon.removeEventListener("click", handleSearch);
    }; */
  }, [cityName]);

  let isNight = true;

  if (weatherData) {
    let main = document.querySelector(".main-container");

    const currentDatetime = new Date(weatherData?.dt * 1000);
    const sunriseDate = new Date(weatherData?.sys?.sunrise * 1000);
    const sunsetDate = new Date(weatherData?.sys?.sunset * 1000);

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currenTime = currentDatetime.toLocaleDateString(undefined, options);
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

    const isDayTime =
      sunriseDate <= currentDatetime && currentDatetime <= sunsetDate; // new variable for readable code

    if (isDayTime) {
      isNight = false;
      main.classList.add("day");
      main.classList.remove("night");
    } else {
      isNight = true;
      main.classList.add("night");
      main.classList.remove("day");
    }
  }
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

  const weatherImg =
    weatherImages[weatherConditionRef.current] || weatherImages.default;
  return (
    <div className="App">
      <div className="main-container">
        <div className="search-bar-container">
          <span className="search-bar">
            <span>
              <input
                id="search-input"
                type="text"
                placeholder="e.g New York..."
              />
              <label htmlFor="search-input">
                Please provide a city with attention to spelling
              </label>
            </span>
            <button className="search-icon">
              <i className="fa-solid fa-magnifying-glass fa-rotate-90"></i>{" "}
            </button>{" "}
          </span>
        </div>
        <section className="sub-container">
          <span className="weather-description">
            <div className="weather-img-container">
              <img src={weatherImg} alt="" />
            </div>
            <ul className="city-name-container">
              <li className="name">{cityName}</li>
              <li>
                {" "}
                <span className="temperature">
                  {Math.floor(weatherData?.main?.temp) || "-"}
                </span>
              </li>
              {/* <li className="time">{currenTime}</li> */}
              <li className="description">
                {weatherData?.weather[0]?.description}
              </li>
              {/* <li className="minmax">
                <span>H : {"99°" || "-"} </span>
                <span>L : {"99°" || "-"} </span>
              </li> */}
            </ul>
          </span>
          <div className="weather-info">
            <div className="humidity-feels">
              <span className="humidity">
                <b>HUMIDITY</b>
                <p>{weatherData?.main?.humidity || "-"}%</p>
              </span>
              <span className="feels">
                <b>FEELS LIKE</b>
                <p>{Math.floor(weatherData?.main?.feels_like) || "-"}°</p>
              </span>
            </div>
            <div className="sunrise-sunset">
              <span className="sunrise">
                <b>SUNRISE</b>
                <p>{sunriseTime || "-"}</p>
              </span>
              <span className="sunset">
                <b>SUNSET</b>
                <p>{sunsetTime || "-"}</p>
              </span>
            </div>

            <div className="wind-visibility">
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
                <b>SUNSET</b>
                <p>
                  {weatherData?.main?.pressure || "-"} <small>hPa</small>
                </p>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
