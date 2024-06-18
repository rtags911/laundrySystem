document.addEventListener(
  "DOMContentLoaded",
  function () {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll("[data-bss-tooltip]")
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    var charts = document.querySelectorAll("[data-bss-chart]");

    for (var chart of charts) {
      try {
        var chartData = chart.dataset.bssChart;
        if (chartData) {
          chart.chart = new Chart(chart, JSON.parse(chartData));
        } else {
          console.error("No data found for chart:", chart);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  },
  false
);
