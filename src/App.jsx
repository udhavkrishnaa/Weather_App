
import React, { useState } from "react";
import "./App.css";

function getWeatherCondition(code) {
  const map = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Snow Fall",
    80: "Rain Showers",
    95: "Thunderstorm"
  };
  return map[code] || "Unknown";
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) throw new Error("City not found");

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`
      );

      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country,
        temperature: weatherData.current.temperature_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCondition: getWeatherCondition(weatherData.current.weather_code),
        time: weatherData.current.time,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🌤 Weather Search App</h1>

      <div className="search-box">
        <input
          type="text"
          value={city}
          placeholder="Enter city name"
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={searchWeather}>Search</button>
      </div>

      {loading && <p>Loading weather data...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="card">
          <h2>{weather.city}, {weather.country}</h2>
          <p><strong>Temperature:</strong> {weather.temperature}°C</p>
          <p><strong>Wind Speed:</strong> {weather.windSpeed} km/h</p>
          <p><strong>Weather Condition:</strong> {weather.weatherCondition}</p>
          <p><strong>Time of Observation:</strong> {weather.time}</p>
        </div>
      )}
    </div>
  );
}
