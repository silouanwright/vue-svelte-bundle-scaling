export const locations = [
  {
    id: "chicago",
    city: "Chicago",
    region: "Illinois",
    country: "United States",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: "london",
    city: "London",
    region: "England",
    country: "United Kingdom",
    latitude: 51.5072,
    longitude: -0.1276,
  },
  {
    id: "tokyo",
    city: "Tokyo",
    region: "Kantō",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: "sydney",
    city: "Sydney",
    region: "New South Wales",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
  },
];

const conditions = [
  { code: "partly-cloudy", label: "Partly cloudy", icon: "⛅" },
  { code: "sunny", label: "Sunny", icon: "☀️" },
  { code: "rain", label: "Light rain", icon: "🌦️" },
  { code: "cloudy", label: "Cloudy", icon: "☁️" },
  { code: "wind", label: "Windy", icon: "💨" },
];

function day(offset) {
  const value = new Date("2026-07-27T12:00:00Z");
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString();
}

function forecast(seed) {
  return Array.from({ length: 7 }, (_, index) => {
    const condition = conditions[(seed + index) % conditions.length];
    return {
      date: day(index),
      condition,
      highCelsius: 22 + ((seed + index * 2) % 9),
      lowCelsius: 13 + ((seed + index) % 7),
      precipitation: (seed * 7 + index * 13) % 80,
      windKph: 8 + ((seed + index * 3) % 24),
    };
  });
}

export const weatherByLocation = Object.fromEntries(
  locations.map((location, index) => {
    const condition = conditions[index % conditions.length];
    return [
      location.id,
      {
        location,
        observedAt: "2026-07-27T12:00:00Z",
        condition,
        temperatureCelsius: 23 + index * 2,
        feelsLikeCelsius: 24 + index * 2,
        humidity: 52 + index * 7,
        pressureHpa: 1009 + index * 3,
        visibilityKm: 12 - index,
        windKph: 11 + index * 4,
        windDirection: ["NE", "W", "SE", "N"][index],
        sunrise: "05:41",
        sunset: "20:14",
        forecast: forecast(index + 1),
      },
    ];
  }),
);
