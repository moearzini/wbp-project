// resources/github/application.js
// Application-Manifest für die GitHub-App (Tool-App)

(() => {
  const app = window.APP_REGISTRY && window.APP_REGISTRY["github"];
  if (!app) {
    console.warn("GitHub app not found in APP_REGISTRY.");
    return;
  }

  app.config = {
    id: "github",
    type: "tool",
    title: "GitHub",
    icon: "github",

    options: {
      searchable: true,
      window: {
        width: 1100,
        height: 500,
        resizable: true
      }
    },

    entry: {
      type: "html",
      file: "github.html"
    }
  };
})();
