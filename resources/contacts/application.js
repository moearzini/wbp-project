// resources/contacts/application.js
// Application-Manifest für die Kontakte-App

(() => {
  const app = window.APP_REGISTRY && window.APP_REGISTRY["contacts"];
  if (!app) {
    console.warn("Contacts app not found in APP_REGISTRY.");
    return;
  }

  app.config = {
    id: "contacts",
    type: "tool",
    title: "Kontakte",
    icon: "users",

    options: {
      searchable: true,
      window: {
        width: 800,
        height: 480,
        resizable: false
      }
    },

    entry: {
      type: "html",
      file: "contacts.html"
    }
  };
})();
