// resources/accordeon/application.js
// Application-Manifest für die Accordeon-Demo

(() => {
  const app = window.APP_REGISTRY && window.APP_REGISTRY["accordeon"];
  if (!app) {
    console.warn("Accordeon app not found in APP_REGISTRY.");
    return;
  }

  app.config = {
    id: "accordeon",
    type: "tool",
    title: "Accordeon Demo",
    icon: "list",

    options: {
      searchable: true,
      window: {
        width: 650,
        height: 480,
        resizable: false
      }
    },

    entry: {
      type: "html",
      file: "accordeon.html"
    }
  };
})();
