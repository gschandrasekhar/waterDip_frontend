let bookings = [];

fetch("hotel_bookings_1000.csv")
  .then((response) => response.text())
  .then((data) => {
    bookings = parseCSV(data);
    drawCharts(bookings);
    populateCountryFilter(bookings);
  });

function parseCSV(data) {
  const rows = data.split("\n").slice(1);
  return rows.map((row) => {
    const [year, month, day, adults, children, babies, country] =
      row.split(",");
    return {
      date: new Date(year, month - 1, day),
      visitors: parseInt(adults) + parseInt(children) + parseInt(babies),
      adults: parseInt(adults),
      children: parseInt(children),
      babies: parseInt(babies),
      country: country.trim(),
    };
  });
}

function drawCharts(data) {
  drawTimeSeriesChart(data);
  drawCountryChart(data);
  drawSparklines(data);
}

function drawTimeSeriesChart(data) {
  const seriesData = data.reduce((acc, booking) => {
    const dateStr = booking.date.toISOString().split("T")[0];
    acc[dateStr] = (acc[dateStr] || 0) + booking.visitors;
    return acc;
  }, {});

  const chartData = Object.keys(seriesData).map((date) => ({
    x: date,
    y: seriesData[date],
  }));

  var options = {
    chart: { type: "line", zoom: { enabled: true } },
    series: [{ name: "Visitors", data: chartData }],
    xaxis: { type: "datetime" },
  };

  var chart = new ApexCharts(
    document.querySelector("#visitors-time-series"),
    options
  );
  chart.render();
}

function drawCountryChart(data) {
  const countryData = data.reduce((acc, booking) => {
    acc[booking.country] = (acc[booking.country] || 0) + booking.visitors;
    return acc;
  }, {});

  const chartData = Object.keys(countryData).map((country) => ({
    x: country,
    y: countryData[country],
  }));

  var options = {
    chart: { type: "bar" },
    series: [{ name: "Visitors", data: chartData }],
    xaxis: { type: "category" },
  };

  var chart = new ApexCharts(
    document.querySelector("#visitors-country"),
    options
  );
  chart.render();
}

function drawSparklines(data) {
  const totalAdults = data.reduce((sum, booking) => sum + booking.adults, 0);
  const totalChildren = data.reduce(
    (sum, booking) => sum + booking.children,
    0
  );

  var optionsAdults = {
    chart: { type: "line", sparkline: { enabled: true } },
    series: [{ name: "Adults", data: [totalAdults] }],
    title: { text: `Adults: ${totalAdults}`, offsetX: 20 },
  };
  var chartAdults = new ApexCharts(
    document.querySelector("#adults-sparkline"),
    optionsAdults
  );
  chartAdults.render();

  var optionsChildren = {
    chart: { type: "line", sparkline: { enabled: true } },
    series: [{ name: "Children", data: [totalChildren] }],
    title: { text: `Children: ${totalChildren}`, offsetX: 20 },
  };
  var chartChildren = new ApexCharts(
    document.querySelector("#children-sparkline"),
    optionsChildren
  );
  chartChildren.render();
}

function populateCountryFilter(data) {
  const countryFilter = document.getElementById("country-filter");
  const uniqueCountries = [...new Set(data.map((item) => item.country))];

  uniqueCountries.forEach((country) => {
    let option = document.createElement("option");
    option.value = country;
    option.innerText = country;
    countryFilter.appendChild(option);
  });
}

function filterByCountry() {
  const selectedCountry = document.getElementById("country-filter").value;
  const filteredData = selectedCountry
    ? bookings.filter((item) => item.country === selectedCountry)
    : bookings;
  drawCharts(filteredData);
}

function filterData() {
  const startDate = new Date(document.getElementById("start-date").value);
  const endDate = new Date(document.getElementById("end-date").value);

  const filteredData = bookings.filter(
    (booking) => booking.date >= startDate && booking.date <= endDate
  );

  drawCharts(filteredData);
}
