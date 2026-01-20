(() => {
  const API_URL = "https://cloudflare-dns.com/dns-query";

  function isValidDomain(domain) {
    const domainPattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(domain) && domain.length <= 253;
  }

  async function lookupDNS(domain, type) {
    const url = `${API_URL}?name=${encodeURIComponent(domain)}&type=${type}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/dns-json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to look up DNS records");
    }
    return response.json();
  }

  function displayResults(data, recordType) {
    const tableBody = document.getElementById("records-table");
    tableBody.innerHTML = "";

    if (!data.Answer || data.Answer.length === 0) {
      const row = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.className = "text-center py-4 text-muted";
      td.textContent = `No ${recordType} records found for this domain.`;
      row.appendChild(td);
      tableBody.appendChild(row);
    } else {
      data.Answer.forEach((record) => {
        const row = document.createElement("tr");

        const td1 = document.createElement("td");
        td1.className = "ps-4 fw-medium";
        td1.textContent = recordType;
        row.appendChild(td1);

        const td2 = document.createElement("td");
        td2.textContent = record.name;
        row.appendChild(td2);

        const td3 = document.createElement("td");
        td3.textContent = record.TTL;
        row.appendChild(td3);

        const td4 = document.createElement("td");
        td4.className = "text-break";
        td4.textContent = record.data;
        row.appendChild(td4);

        tableBody.appendChild(row);
      });
    }

    document.getElementById("results").classList.remove("d-none");
  }

  function showError(message) {
    const errorEl = document.getElementById("error");
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function hideError() {
    document.getElementById("error").classList.add("d-none");
  }

  function showLoading() {
    document.getElementById("loading").classList.remove("d-none");
    document.getElementById("results").classList.add("d-none");
    hideError();
  }

  function hideLoading() {
    document.getElementById("loading").classList.add("d-none");
  }

  async function handleLookup() {
    const domainInput = document.getElementById("domain-input").value.trim();
    const recordType = document.getElementById("record-type").value;

    if (!domainInput) {
      showError("Please enter a domain name");
      return;
    }

    if (!isValidDomain(domainInput)) {
      showError("Please enter a valid domain name");
      return;
    }

    showLoading();

    try {
      const data = await lookupDNS(domainInput, recordType);
      hideLoading();
      displayResults(data, recordType);
    } catch (error) {
      hideLoading();
      showError(
        error.message || "Failed to look up DNS records. Please try again.",
      );
    }
  }

  function init() {
    document
      .getElementById("lookup-btn")
      .addEventListener("click", handleLookup);
    document
      .getElementById("domain-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleLookup();
        }
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
