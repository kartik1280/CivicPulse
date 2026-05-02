// src/components/WeatherWidget.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const TAG_ICONS = {
  Clear:        '☀️',
  Clouds:       '☁️',
  Rain:         '🌧️',
  Drizzle:      '🌦️',
  Thunderstorm: '⛈️',
  Snow:         '❄️',
  Mist:         '🌫️',
  Haze:         '🌫️',
  Fog:          '🌫️',
};

function WeatherWidget({ city }) {
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      setError('Weather API key not configured');
      setLoading(false);
      return;
    }

    axios
      .get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { q: city, appid: apiKey, units: 'metric' },
      })
      .then(({ data }) => {
        setWeather({
          temp:        Math.round(data.main.temp),
          feelsLike:   Math.round(data.main.feels_like),
          humidity:    data.main.humidity,
          description: data.weather[0].description,
          main:        data.weather[0].main,
          windSpeed:   data.wind.speed,
          icon:        data.weather[0].icon,
        });
      })
      .catch(() => setError('Weather unavailable'))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse">
        <div className="skeleton w-6 h-6 rounded-full" />
        <div className="skeleton w-20 h-3 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 text-xs">
        <span>🌐</span>
        <span>{error}</span>
      </div>
    );
  }

  const emoji = TAG_ICONS[weather.main] || '🌡️';

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800/30 animate-fade-in">
      <span className="text-2xl leading-none">{emoji}</span>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-surface-900 dark:text-surface-100">{weather.temp}°C</span>
          <span className="text-xs text-surface-500 dark:text-surface-400 capitalize">{weather.description}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
          <span>💧 {weather.humidity}%</span>
          <span>💨 {weather.windSpeed} m/s</span>
          <span>Feels {weather.feelsLike}°C</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
