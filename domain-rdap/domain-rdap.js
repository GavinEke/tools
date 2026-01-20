(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const domainInput = document.getElementById("domainInput");
  const lookupBtn = document.getElementById("lookupBtn");
  const resultsDiv = document.getElementById("results");

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

  const themeData = localStorage.getItem(THEME_KEY);
  if (themeData) {
    try {
      const data = JSON.parse(themeData);
      if (data.theme) currentTheme = data.theme;
    } catch (e) {
      console.warn("Failed to load theme:", e);
    }
  }
  setTheme(currentTheme);

  const performLookup = () => {
    const domain = domainInput.value.trim();
    if (!domain) {
      displayError("Please enter a domain");
      return;
    }
    lookup(domain);
  };

  lookupBtn.addEventListener("click", performLookup);
  domainInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performLookup();
    }
  });

  async function lookup(domain) {
    resultsDiv.innerHTML =
      '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
    const tld = domain.toLowerCase().split(".").pop();
    try {
      const bootstrapRes = await fetch(`https://rdap.iana.org/domain/${tld}`);
      if (!bootstrapRes.ok) throw new Error("TLD not supported");
      const bootstrapData = await bootstrapRes.json();
      let baseUrl;
      if (bootstrapData.services && bootstrapData.services.length > 0) {
        baseUrl = bootstrapData.services[0][0];
      } else if (bootstrapData.links) {
        const rdapLink = bootstrapData.links.find(
          (link) => link.title === "RDAP Server",
        );
        if (rdapLink) {
          baseUrl = rdapLink.href;
        }
      }
      if (!baseUrl) throw new Error("No RDAP service for this TLD");
      const domainRes = await fetch(`${baseUrl}domain/${domain}`);
      if (!domainRes.ok) {
        if (domainRes.status === 404) throw new Error("Domain not found");
        throw new Error(`Lookup failed: ${domainRes.status}`);
      }
      const data = await domainRes.json();
      displayResults(data, domain);
    } catch (error) {
      displayError(error.message);
    }
  }

  function displayResults(data, domain) {
    const domainName = data.ldhName || data.handle || domain;
    const registrar = findRegistrar(data.entities);
    const created = findEventDate(data.events, "registration");
    const expires = findEventDate(data.events, "expiration");
    const nameservers = data.nameservers
      ? data.nameservers.map((ns) => ns.ldhName || ns.unicodeName).join(", ")
      : "N/A";
    const status = data.status
      ? data.status.map((s) => s.status || s).join(", ")
      : "N/A";

    const card = document.createElement("div");
    card.className = "card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.textContent = `WHOIS Results for ${domainName}`;
    card.appendChild(cardHeader);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const ul = document.createElement("ul");
    ul.className = "list-group list-group-flush";

    const li1 = document.createElement("li");
    li1.className = "list-group-item";
    li1.innerHTML = "<strong>Domain:</strong> ";
    li1.appendChild(document.createTextNode(domainName));
    ul.appendChild(li1);

    const li2 = document.createElement("li");
    li2.className = "list-group-item";
    li2.innerHTML = "<strong>Registrar:</strong> ";
    li2.appendChild(document.createTextNode(registrar));
    ul.appendChild(li2);

    const li3 = document.createElement("li");
    li3.className = "list-group-item";
    li3.innerHTML = "<strong>Created:</strong> ";
    li3.appendChild(document.createTextNode(created));
    ul.appendChild(li3);

    const li4 = document.createElement("li");
    li4.className = "list-group-item";
    li4.innerHTML = "<strong>Expires:</strong> ";
    li4.appendChild(document.createTextNode(expires));
    ul.appendChild(li4);

    const li5 = document.createElement("li");
    li5.className = "list-group-item";
    li5.innerHTML = "<strong>Nameservers:</strong> ";
    li5.appendChild(document.createTextNode(nameservers));
    ul.appendChild(li5);

    const li6 = document.createElement("li");
    li6.className = "list-group-item";
    li6.innerHTML = "<strong>Status:</strong> ";
    li6.appendChild(document.createTextNode(status));
    ul.appendChild(li6);

    cardBody.appendChild(ul);
    card.appendChild(cardBody);

    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(card);
  }

  function findRegistrar(entities) {
    if (!entities) return "N/A";
    for (const entity of entities) {
      if (entity.roles && entity.roles.includes("registrar")) {
        if (entity.vcard) {
          for (const vcardItem of entity.vcard) {
            if (vcardItem[0] === "fn") {
              return vcardItem[3];
            }
          }
        }
        return entity.handle || "Unknown";
      }
    }
    return "N/A";
  }

  function findEventDate(events, action) {
    if (!events) return "N/A";
    for (const event of events) {
      if (event.eventAction === action) {
        return new Date(event.eventDate).toLocaleDateString();
      }
    }
    return "N/A";
  }

  function displayError(message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-danger";
    alertDiv.textContent = message;
    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(alertDiv);
  }

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
