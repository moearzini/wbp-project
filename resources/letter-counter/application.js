// resources/letter-counter/application.js
// Application-Manifest für den Buchstaben-Counter

(() => {
  const app = window.APP_REGISTRY && window.APP_REGISTRY["letter-counter"];
  if (!app) {
    console.warn("Letter Counter app not found in APP_REGISTRY.");
    return;
  }

  app.config = {
    id: "letter-counter",
    type: "tool",
    title: "Buchstaben-Counter",
    icon: "text",
    options: {
      searchable: true,
      window: {
        width: 600,
        height: 430,
        resizable: false
      }
    },
    entry: {
      type: "html",
      file: "count-chars.html"
    }
  };
})();