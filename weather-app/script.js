const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const weatherDisplay = document.getElementById('weather-display');
const loading = document.getElementById('loading');
const initialState = document.getElementById('initial-state');

const elements = {
    cityName: document.getElementById('city-name'),
    date: document.getElementById('date'),
    tempValue: document.getElementById('temp-value'),
    weatherIcon: document.getElementById('weather-icon'),
    description: document.getElementById('weather-description'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity')
};

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const weatherCodes = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌧️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    56: { desc: 'Light freezing drizzle', icon: '🌧️❄️' },
    57: { desc: 'Dense freezing drizzle', icon: '🌧️❄️' },
    61: { desc: 'Slight rain', icon: '🌦️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    66: { desc: 'Light freezing rain', icon: '🌧️❄️' },
    67: { desc: 'Heavy freezing rain', icon: '🌧️❄️' },
    71: { desc: 'Slight snow fall', icon: '🌨️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '🌩️' },
    96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

function formatDate() {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date().toLocaleDateString('en-US', options);
}

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
    }
    
    return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
    };
}

async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
}

function updateUI(locationData, weatherData) {
    const current = weatherData.current;
    const codeInfo = weatherCodes[current.weather_code] || { desc: 'Unknown', icon: '❓' };
    
    elements.cityName.textContent = `${locationData.name}${locationData.country ? ', ' + locationData.country : ''}`;
    elements.date.textContent = formatDate();
    elements.tempValue.textContent = Math.round(current.temperature_2m);
    elements.weatherIcon.textContent = codeInfo.icon;
    elements.description.textContent = codeInfo.desc;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
}

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Reset UI state
    errorMessage.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
    initialState.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const locationData = await getCoordinates(city);
        const weatherData = await getWeather(locationData.lat, locationData.lon);
        
        updateUI(locationData, weatherData);
        
        loading.classList.add('hidden');
        weatherDisplay.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching weather:', error);
        loading.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        
        // Show initial state again if there was an error
        if (weatherDisplay.classList.contains('hidden')) {
            initialState.classList.remove('hidden');
        }
    }
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
