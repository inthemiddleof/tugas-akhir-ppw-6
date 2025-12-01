const CONFIG = {
  geoApi: "https://geocoding-api.open-meteo.com/v1/search",
  weatherApi: "https://api.open-meteo.com/v1/forecast",
  iconBaseUrl: "https://basmilius.github.io/weather-icons/production/fill/all/",
};

const DEFAULT_CITY = { name: "Bandar Lampung", lat: -5.45, lon: 105.2667 };

const POPULAR_CITIES = [
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521 },
  { name: "Bandung", lat: -6.9175, lon: 107.6191 },
  { name: "Medan", lat: 3.5952, lon: 98.6722 },
  { name: "Makassar", lat: -5.1477, lon: 119.4328 },
];

let state = {
  city: DEFAULT_CITY.name,
  lat: DEFAULT_CITY.lat,
  lon: DEFAULT_CITY.lon,
  unit: "C",
  data: null,
  saved: JSON.parse(localStorage.getItem("cleanFavs")) || [],
};

const els = {
  input: document.getElementById("city-input"),
  suggestions: document.getElementById("suggestions"),
  loader: document.getElementById("loader"),
  content: document.getElementById("weather-content"),
  cityName: document.getElementById("city-name"),
  time: document.getElementById("timestamp"),
  temp: document.getElementById("temp-val"),
  desc: document.getElementById("weather-desc"),
  mainIcon: document.getElementById("main-icon"),
  wind: document.getElementById("wind-val"),
  humid: document.getElementById("humid-val"),
  uv: document.getElementById("uv-val"),
  hourlyList: document.getElementById("hourly-list"),
  forecastList: document.getElementById("forecast-list"),
  defaultList: document.getElementById("default-city-list"),
  popularList: document.getElementById("popular-cities"),
  savedList: document.getElementById("saved-cities"),
  favBtn: document.getElementById("fav-btn"),
  favIcon: document.getElementById("fav-icon"),
  themeToggle: document.getElementById("theme-toggle"),
  refreshBtn: document.getElementById("refresh-btn"),
  btnC: document.getElementById("btn-c"),
  btnF: document.getElementById("btn-f"),
  sidebar: document.getElementById("sidebar"),
  openSidebarBtn: document.getElementById("open-sidebar"),
  closeSidebarBtn: document.getElementById("close-sidebar"),
  sidebarOverlay: document.getElementById("sidebar-overlay"),
};

async function fetchWeather() {
  showLoading(true);
  try {
    const params = new URLSearchParams({
      latitude: state.lat,
      longitude: state.lon,
      current_weather: true,
      hourly:
        "temperature_2m,relativehumidity_2m,weathercode,visibility,is_day",
      daily:
        "weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max",
      timezone: "auto",
    });
    const res = await fetch(`${CONFIG.weatherApi}?${params}`);
    state.data = await res.json();
    render();
    updateFavState();
  } catch (err) {
    console.error(err);
    alert("Gagal mengambil data");
  } finally {
    showLoading(false);
  }
}

function render() {
  if (!state.data) return;
  const { current_weather, daily, hourly } = state.data;
  els.cityName.textContent = state.city;
  const now = new Date();
  els.time.textContent =
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) +
    " • " +
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  els.temp.textContent = convertTemp(current_weather.temperature);

  const isDay = current_weather.is_day === 1;
  const iconData = getIconData(current_weather.weathercode, isDay);
  els.desc.textContent = iconData.label;
  els.mainIcon.src = iconData.url;

  const curIdx = now.getHours();
  els.wind.textContent = current_weather.windspeed;
  els.humid.textContent = hourly.relativehumidity_2m[curIdx] || "--";
  els.uv.textContent = daily.uv_index_max[0];

  renderHourly(hourly, curIdx);
  renderForecast(daily);
}

function renderForecast(daily) {
  els.forecastList.innerHTML = "";

  const validMax = daily.temperature_2m_max
    .slice(1, 6)
    .filter((t) => t != null);
  const validMin = daily.temperature_2m_min
    .slice(1, 6)
    .filter((t) => t != null);
  if (validMax.length === 0) return;

  const globalMax = Math.max(...validMax);
  const globalMin = Math.min(...validMin);
  const totalRange = globalMax - globalMin || 1;

  for (let i = 1; i <= 5; i++) {
    const date = new Date(daily.time[i]);
    const day = date.toLocaleDateString("id-ID", { weekday: "long" });
    const iconData = getIconData(daily.weathercode[i], true);
    const max = convertTemp(daily.temperature_2m_max[i]);
    const min = convertTemp(daily.temperature_2m_min[i]);
    const rain = daily.precipitation_probability_max[i];

    const leftPercent =
      ((daily.temperature_2m_min[i] - globalMin) / totalRange) * 100;
    const widthPercent = Math.max(
      ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) /
        totalRange) *
        100,
      5
    );

    const html = `
            <div class="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                
                <div class="col-span-3 md:col-span-2 font-semibold text-xs md:text-sm text-slate-700 dark:text-slate-200 truncate">${day}</div>
                
                <div class="col-span-3 md:col-span-2 flex flex-col items-center justify-center">
                    <img src="${
                      iconData.url
                    }" class="w-8 h-8 md:w-9 md:h-9 icon-pop" alt="icon">
                    <span class="text-[10px] text-slate-600 dark:text-slate-400 text-center font-medium leading-tight mt-1 hidden md:block">${
                      iconData.label
                    }</span>
                </div>

                <div class="col-span-2 md:col-span-3 text-center text-xs md:text-sm font-bold ${
                  rain > 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-300"
                }">
                    ${rain > 0 ? rain + "%" : "0%"}
                </div>

                <div class="col-span-4 md:col-span-5 flex items-center gap-2">
                     <span class="text-slate-500 dark:text-slate-400 text-xs w-8 text-right font-medium">${min}°</span>
                     
                     <div class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
                        <div class="h-full rounded-full bg-gradient-to-r from-blue-400 to-red-400 absolute" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
                     </div>
                     
                     <span class="font-bold text-slate-800 dark:text-white text-xs w-8 text-left">${max}°</span>
                </div>
            </div>
        `;
    els.forecastList.innerHTML += html;
  }
}

function renderHourly(hourly, startIdx) {
  els.hourlyList.innerHTML = "";
  for (let i = startIdx; i < startIdx + 24; i++) {
    if (!hourly.time[i]) break;
    const time = new Date(hourly.time[i]).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temp = convertTemp(hourly.temperature_2m[i]);
    const isDay = hourly.is_day[i] === 1;
    const iconData = getIconData(hourly.weathercode[i], isDay);
    const isNow = i === startIdx;

    const html = `
            <div class="flex items-center justify-between p-2 rounded-md ${
              isNow
                ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                : ""
            } hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <span class="text-xs text-slate-600 dark:text-slate-400 w-12 font-medium">${
                  isNow ? "Kini" : time
                }</span>
                
                <div class="flex items-center gap-3 flex-1 justify-center">
                    <img src="${
                      iconData.url
                    }" class="w-6 h-6 icon-pop" alt="icon">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${temp}°</span>
                </div>
            </div>
        `;
    els.hourlyList.innerHTML += html;
  }
}

function getIconData(code, isDay) {
  let filename = "partly-cloudy-day.svg",
    label = "Berawan";
  const suffix = isDay ? "day" : "night";
  switch (code) {
    case 0:
      filename = `clear-${suffix}.svg`;
      label = isDay ? "Cerah" : "Cerah (Malam)";
      break;
    case 1:
    case 2:
      filename = `partly-cloudy-${suffix}.svg`;
      label = "Berawan";
      break;
    case 3:
      filename = `overcast-${suffix}.svg`;
      label = "Mendung";
      break;
    case 45:
    case 48:
      filename = `fog-${suffix}.svg`;
      label = "Berkabut";
      break;
    case 51:
    case 53:
    case 55:
      filename = `drizzle.svg`;
      label = "Gerimis";
      break;
    case 61:
    case 63:
    case 65:
      filename = `rain.svg`;
      label = "Hujan";
      break;
    case 80:
    case 81:
    case 82:
      filename = `rain.svg`;
      label = "Hujan Lebat";
      break;
    case 95:
    case 96:
    case 99:
      filename = `thunderstorms.svg`;
      label = "Badai Petir";
      break;
    default:
      filename = `partly-cloudy-${suffix}.svg`;
      label = "Berawan";
  }
  return { url: `${CONFIG.iconBaseUrl}${filename}`, label: label };
}
function convertTemp(v) {
  return state.unit === "F" ? Math.round((v * 9) / 5 + 32) : Math.round(v);
}
function showLoading(show) {
  els.loader.classList.toggle("hidden", !show);
  els.content.classList.toggle("hidden", show);
}
function updateUnitUI() {
  const activeClass =
    "bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white font-bold";
  const inactiveClass =
    "text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium bg-transparent shadow-none";
  if (state.unit === "C") {
    els.btnC.className = `px-3 py-1 rounded-md text-xs transition ${activeClass}`;
    els.btnF.className = `px-3 py-1 rounded-md text-xs transition ${inactiveClass}`;
  } else {
    els.btnC.className = `px-3 py-1 rounded-md text-xs transition ${inactiveClass}`;
    els.btnF.className = `px-3 py-1 rounded-md text-xs transition ${activeClass}`;
  }
  render();
}
function updateThemeUI() {
  const isDark = document.documentElement.classList.contains("dark");
  const icon = isDark ? "ph-sun" : "ph-moon";
  const text = isDark ? "Mode Terang" : "Mode Gelap";
  els.themeToggle.innerHTML = `<i class="ph ${icon} text-lg"></i> <span>${text}</span>`;
}
function renderLists() {
  els.defaultList.innerHTML = "";
  els.defaultList.appendChild(
    createCityButton(
      DEFAULT_CITY,
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800/50"
    )
  );
  els.popularList.innerHTML = "";
  POPULAR_CITIES.forEach((c) =>
    els.popularList.appendChild(
      createCityButton(
        c,
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      )
    )
  );
  els.savedList.innerHTML = "";
  if (state.saved.length === 0)
    els.savedList.innerHTML =
      '<p class="text-xs text-slate-400 px-2 italic">Belum ada favorit.</p>';
  else
    state.saved.forEach((c) => {
      const btn = createCityButton(
        c,
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      );
      btn.innerHTML = `<span>${c.name}</span> <i class="ph-bold ph-star-fill text-[10px] text-yellow-500"></i>`;
      els.savedList.appendChild(btn);
    });
}
function createCityButton(city, extraClass) {
  const btn = document.createElement("button");
  btn.className = `w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition flex justify-between items-center ${extraClass}`;
  btn.textContent = city.name;
  btn.onclick = () => {
    state.city = city.name;
    state.lat = city.lat;
    state.lon = city.lon;
    fetchWeather();
    toggleSidebar(false);
  };
  return btn;
}
els.btnC.addEventListener("click", () => {
  state.unit = "C";
  updateUnitUI();
});
els.btnF.addEventListener("click", () => {
  state.unit = "F";
  updateUnitUI();
});
els.themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  updateThemeUI();
});
function toggleSidebar(show) {
  if (show) {
    els.sidebar.classList.remove("-translate-x-full");
    els.sidebarOverlay.classList.remove("hidden");
  } else {
    els.sidebar.classList.add("-translate-x-full");
    els.sidebarOverlay.classList.add("hidden");
  }
}
els.openSidebarBtn.addEventListener("click", () => toggleSidebar(true));
els.closeSidebarBtn.addEventListener("click", () => toggleSidebar(false));
els.sidebarOverlay.addEventListener("click", () => toggleSidebar(false));
els.input.addEventListener("input", (e) => {
  clearTimeout(window.sTimer);
  window.sTimer = setTimeout(async () => {
    if (e.target.value.length < 3) return;
    const res = await fetch(
      `${CONFIG.geoApi}?name=${e.target.value}&count=5&language=id&format=json`
    );
    const data = await res.json();
    els.suggestions.innerHTML = "";
    if (data.results) {
      els.suggestions.classList.remove("hidden");
      data.results.forEach((c) => {
        const li = document.createElement("li");
        li.className =
          "px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm border-b dark:border-slate-700 last:border-0";
        li.textContent = `${c.name}, ${c.country}`;
        li.onclick = () => {
          state.city = c.name;
          state.lat = c.latitude;
          state.lon = c.longitude;
          els.input.value = "";
          els.suggestions.classList.add("hidden");
          fetchWeather();
          toggleSidebar(false);
        };
        els.suggestions.appendChild(li);
      });
    }
  }, 500);
});
document.addEventListener("click", (e) => {
  if (!els.input.contains(e.target) && !els.suggestions.contains(e.target))
    els.suggestions.classList.add("hidden");
});
els.refreshBtn.addEventListener("click", fetchWeather);
els.favBtn.addEventListener("click", () => {
  const idx = state.saved.findIndex((c) => c.name === state.city);
  if (idx >= 0) state.saved.splice(idx, 1);
  else state.saved.push({ name: state.city, lat: state.lat, lon: state.lon });
  localStorage.setItem("cleanFavs", JSON.stringify(state.saved));
  updateFavState();
  renderLists();
});
function updateFavState() {
  const isFav = state.saved.some((c) => c.name === state.city);
  els.favIcon.className = isFav
    ? "ph-fill ph-star text-yellow-500"
    : "ph ph-star text-slate-400";
  els.favBtn.className = `flex items-center gap-2 px-4 py-2 rounded-lg border transition text-sm font-medium ${
    isFav
      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
      : "bg-transparent border-borderLight text-gray-700 dark:text-gray-200"
  }`;
}

updateUnitUI();
updateThemeUI();
renderLists();
fetchWeather();
