"use strict";

const btnSearch = document.querySelector(".btn-search");
const inputCountry = document.querySelector(".input-country");
const countriesContainer = document.querySelector(".countries");

// Function to render country data
const renderCountry = function (data, className = "") {
  const {
    name: { common: name },
    flags: { svg: flag },
    region,
    population,
    languages,
    currencies,
  } = data;
  const language = Object.values(languages)[0];
  const currency = Object.values(currencies)[0].name;

  const html = `
  <article class="country ${className}">
    <img class="country__img" src="${flag}" />
    <div class="country__data">
      <h3 class="country__name">${name}</h3>
      <h4 class="country__region">${region}</h4>
      <p class="country__row"><span>👫</span>${(+population / 1000000).toFixed(
        1
      )} people</p>
      <p class="country__row"><span>🗣️</span>${language}</p>
      <p class="country__row"><span>💰</span>${currency}</p>
    </div>
  </article>
  `;
  // Insert HTML into the container
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
};

// Function to render error message
const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  countriesContainer.style.opacity = 1;
};

// Function to fetch JSON data from a URL
const getJSON = async function (url, errorMsg = "Something went wrong") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
  return await response.json();
};

// Main function
const getCountryData = async function (country) {
  try {
    // Clear previous results
    countriesContainer.innerHTML = "";

    const data = await getJSON(
      `https://restcountries.com/v3.1/name/${country}`,
      "Country not found"
    );
    const countryData = data[0];
    renderCountry(countryData);

    const neighbours = countryData.borders;

    if (!neighbours || neighbours.length === 0) return;

    // Fetch neighbour countries data
    const neighbourDataArray = await Promise.all(
      neighbours.map((code) =>
        getJSON(
          `https://restcountries.com/v3.1/alpha/${code}`,
          "Neighbour not found"
        )
      )
    );
    // Render each neighbour country
    neighbourDataArray.forEach((neighbour) => {
      renderCountry(neighbour[0], "neighbour");
    });
  } catch (err) {
    console.error(`💥${err}`);
    renderError(`💥💥 ${err.message}. Try again!`);
  }
};

// Event listener for search button
btnSearch.addEventListener("click", function () {
  const country = inputCountry.value.trim();
  if (!country) return;
  getCountryData(country);
});

// Event listener for 'Enter' key press
inputCountry.addEventListener("keydown", function (e) {
  if (e.key === "Enter") btnSearch.click();
});
