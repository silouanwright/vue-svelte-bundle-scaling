export function convertTemperature(celsius, unit) {
  return unit === "fahrenheit"
    ? Math.round((celsius * 9) / 5 + 32)
    : Math.round(celsius);
}

export function temperatureLabel(celsius, unit) {
  const suffix = unit === "fahrenheit" ? "°F" : "°C";
  return `${convertTemperature(celsius, unit)}${suffix}`;
}

export function formatDay(value, index) {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(value),
  );
}

export function locationLabel(location) {
  return `${location.city}, ${location.region}`;
}

export function findLocations(locations, query) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];
  return locations
    .filter((location) =>
      [location.city, location.region, location.country]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
    .slice(0, 5);
}

export function weatherSummary(weather, unit) {
  return `${weather.condition.label}, ${temperatureLabel(
    weather.temperatureCelsius,
    unit,
  )}, humidity ${weather.humidity}%`;
}
