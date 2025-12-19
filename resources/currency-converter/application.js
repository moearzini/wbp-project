// resources/currency-converter/application.js
// Application-Manifest für den Currency Converter (Tool-App)

(() => {
  const app = window.APP_REGISTRY && window.APP_REGISTRY["currency-converter"];
  if (!app) {
    console.warn("Currency Converter app not found in APP_REGISTRY.");
    return;
  }

  app.config = {
    id: "currency-converter",
    type: "tool",
    title: "Währungsrechner",
    icon: "calculator",

    options: {
      searchable: true,
      window: {
        width: 500,
        height: 430,
        resizable: false
      }
    },

    entry: {
      type: "html",
      file: "currency-converter.html"
    }
  };
})();