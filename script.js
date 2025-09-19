        class WeatherTracker {
            constructor() {
                this.apiUrl = 'https://wttr.in';
                this.favorites = this.loadFavorites();
                this.currentCity = '';
                this.init();
            }

            init() {
                this.bindEvents();
                this.renderFavorites();
            }

            bindEvents() {
                const searchBtn = document.getElementById('searchBtn');
                const locationBtn = document.getElementById('locationBtn');
                const cityInput = document.getElementById('cityInput');
                const addFavorite = document.getElementById('addFavorite');

                searchBtn.addEventListener('click', () => this.searchWeather());
                locationBtn.addEventListener('click', () => this.getCurrentLocation());
                cityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.searchWeather();
                });
                addFavorite.addEventListener('click', () => this.addToFavorites());
            }

            async searchWeather() {
                const cityInput = document.getElementById('cityInput');
                const city = cityInput.value.trim();
                
                if (!city) {
                    this.showError('Please enter a city name');
                    return;
                }

                await this.fetchWeather(city);
            }

            async fetchWeather(city) {
                this.showLoading();
                this.hideError();
                this.hideWeatherCard();

                try {
                    const response = await fetch(`${this.apiUrl}/${encodeURIComponent(city)}?format=j1`);
                    
                    if (!response.ok) {
                        throw new Error('City not found');
                    }

                    const data = await response.json();
                    this.displayWeather(data, city);
                    this.currentCity = city;

                    console.log("Weather API JSON Response:", data.latitude);
                    
                } catch (error) {
                    this.showError('City not found. Please check the spelling and try again.');
                } finally {
                    this.hideLoading();
                }
            }

            displayWeather(data, city) {
                const current = data.current_condition[0];
                const weather = data.weather[0];
                
                // Update elements
                document.getElementById('cityName').textContent = city.charAt(0).toUpperCase() + city.slice(1);
                document.getElementById('temperature').textContent = `${current.temp_C}°C`;
                document.getElementById('condition').textContent = current.weatherDesc[0].value;
                document.getElementById('humidity').textContent = `${current.humidity}%`;
                document.getElementById('windSpeed').textContent = `${current.windspeedKmph} km/h`;
                document.getElementById('feelsLike').textContent = `${current.FeelsLikeC}°C`;
                document.getElementById('visibility').textContent = `${current.visibility} km`;

                // Set weather icon
                const icon = this.getWeatherIcon(current.weatherCode);
                document.getElementById('weatherIcon').textContent = icon;

                // Change background based on weather
                this.updateBackground(current.weatherCode);

                this.showWeatherCard();
            }

            getWeatherIcon(weatherCode) {
                if (['113'].includes(weatherCode)) {
                    return '☀️'; // Sunny
                } else if (['116','119','122','143','248','260'].includes(weatherCode)) {
                    return '☁️'; // Cloudy / Mist / Fog
                } else if (weatherCode >= 176 && weatherCode <= 377) {
                    return '🌧️'; // Rain / Thunder / Sleet
                } else if (weatherCode >= 323 && weatherCode <= 395) {
                    return '❄️'; // Snow
                } else {
                    return '🌤️'; // Default partly sunny
                }
            }

            updateBackground(weatherCode) {
                const body = document.body;
                body.className = ''; // Reset classes
                
                if (['113'].includes(weatherCode)) {
                    body.classList.add('sunny');
                } else if (['116', '119', '122'].includes(weatherCode)) {
                    body.classList.add('cloudy');
                } else if (weatherCode.startsWith('2') || weatherCode.startsWith('3')) {
                    body.classList.add('rainy');
                } else if (weatherCode.startsWith('323') || weatherCode.startsWith('32') || weatherCode.startsWith('33') || weatherCode.startsWith('368') || weatherCode.startsWith('371')) {
                    body.classList.add('snowy');
                }
            }

            getCurrentLocation() {
                if (!navigator.geolocation) {
                    this.showError('Geolocation is not supported by this browser');
                    return;
                }

                this.showLoading();
                
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await this.fetchWeatherByCoords(latitude, longitude);
                    },
                    (error) => {
                        this.hideLoading();
                        this.showError('Unable to get your location. Please enter a city manually.');
                    }
                );
            }

            async fetchWeatherByCoords(lat, lon) {
                try {
                    const response = await fetch(`${this.apiUrl}/${lat},${lon}?format=j1`);
                    
                    if (!response.ok) {
                        throw new Error('Unable to fetch weather for your location');
                    }

                    const data = await response.json();
                    this.displayWeather(data, 'Your Location');
                    this.currentCity = 'Your Location';
                    
                } catch (error) {
                    this.showError('Unable to fetch weather for your location');
                } finally {
                    this.hideLoading();
                }
            }

            addToFavorites() {
                if (!this.currentCity || this.currentCity === 'Your Location') {
                    return;
                }

                if (!this.favorites.includes(this.currentCity)) {
                    this.favorites.push(this.currentCity);
                    this.saveFavorites();
                    this.renderFavorites();
                }
            }

            renderFavorites() {
                const container = document.getElementById('favoriteCities');
                container.innerHTML = '';

                this.favorites.forEach(city => {
                    const cityElement = document.createElement('div');
                    cityElement.className = 'favorite-city';
                    cityElement.textContent = city;
                    cityElement.addEventListener('click', () => {
                        document.getElementById('cityInput').value = city;
                        this.fetchWeather(city);
                    });
                    container.appendChild(cityElement);
                });

                document.getElementById('favorites').style.display = 
                    this.favorites.length > 0 ? 'block' : 'none';
            }

            loadFavorites() {
                // Using in-memory storage instead of localStorage for artifact compatibility
                return this.favorites || ['London', 'New York', 'Tokyo'];
            }

            saveFavorites() {
                // In a real implementation, this would use localStorage
                // For artifacts, we keep it in memory
            }

            showLoading() {
                document.getElementById('loading').style.display = 'block';
            }

            hideLoading() {
                document.getElementById('loading').style.display = 'none';
            }

            showWeatherCard() {
                document.getElementById('weatherCard').style.display = 'block';
            }

            hideWeatherCard() {
                document.getElementById('weatherCard').style.display = 'none';
            }

            showError(message) {
                document.getElementById('errorMessage').textContent = message;
                document.getElementById('error').style.display = 'block';
            }

            hideError() {
                document.getElementById('error').style.display = 'none';
            }
        }

        // Initialize the weather tracker when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new WeatherTracker();
        });