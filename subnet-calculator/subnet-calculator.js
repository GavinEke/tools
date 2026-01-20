(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  function ipToLong(ip) {
    return (
      ip
        .split(".")
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  }

  function longToIp(long) {
    return [
      (long >>> 24) & 255,
      (long >>> 16) & 255,
      (long >>> 8) & 255,
      long & 255,
    ].join(".");
  }

  function getSubnetMask(cidr) {
    if (cidr === 0) return 0;
    return (~0 >>> (32 - cidr)) << (32 - cidr);
  }

  function getWildcardMask(cidr) {
    return ~getSubnetMask(cidr) >>> 0;
  }

  function getNetworkAddress(ipLong, mask) {
    return (ipLong & mask) >>> 0;
  }

  function getBroadcastAddress(networkAddress, mask) {
    return (networkAddress | ~mask) >>> 0;
  }

  function getUsableHosts(cidr) {
    if (cidr === 32) return 0;
    if (cidr === 31) return 0;
    return Math.pow(2, 32 - cidr) - 2;
  }

  function getIpClass(ip) {
    const firstOctet = parseInt(ip.split(".")[0], 10);
    if (firstOctet >= 1 && firstOctet <= 126) return "Class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "Class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "Class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "Class D (Multicast)";
    if (firstOctet >= 240 && firstOctet <= 255) return "Class E (Experimental)";
    return "Unknown";
  }

  function getAddressType(ip, network, broadcast) {
    const ipLong = ipToLong(ip);
    if (ipLong === network) return "Network Address";
    if (ipLong === broadcast) return "Broadcast Address";
    return "Usable Host";
  }

  function longToBinaryString(long, bits = 32) {
    let binary = (long >>> 0).toString(2);
    while (binary.length < bits) {
      binary = "0" + binary;
    }
    return binary.match(/.{1,8}/g).join(".");
  }

  function isValidIp(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
    });
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function calculateSubnet() {
    const ipInput = document.getElementById("ip-address").value.trim();
    const cidr = parseInt(document.getElementById("cidr").value, 10);

    if (!isValidIp(ipInput)) {
      alert("Please enter a valid IP address");
      return;
    }

    const ipLong = ipToLong(ipInput);
    const mask = getSubnetMask(cidr);
    const wildcard = getWildcardMask(cidr);
    const networkLong = getNetworkAddress(ipLong, mask);
    const broadcastLong = getBroadcastAddress(networkLong, mask);
    const usableHosts = getUsableHosts(cidr);

    const networkIp = longToIp(networkLong);
    const broadcastIp = longToIp(broadcastLong);
    const maskIp = longToIp(mask);
    const wildcardIp = longToIp(wildcard);

    let rangeStr;
    if (cidr === 32) {
      rangeStr = "N/A (/32 has no hosts)";
    } else if (cidr === 31) {
      rangeStr = "N/A (/31 is point-to-point)";
    } else {
      const firstUsable = longToIp(networkLong + 1);
      const lastUsable = longToIp(broadcastLong - 1);
      rangeStr = `${firstUsable} - ${lastUsable}`;
    }

    document.getElementById("result-network").textContent = networkIp;
    document.getElementById("result-broadcast").textContent = broadcastIp;
    document.getElementById("result-mask").textContent = `${maskIp} (/${cidr})`;
    document.getElementById("result-wildcard").textContent = wildcardIp;
    document.getElementById("result-range").textContent = rangeStr;
    document.getElementById("result-hosts").textContent = formatNumber(
      Math.pow(2, 32 - cidr),
    );
    document.getElementById("result-usable").textContent =
      formatNumber(usableHosts);
    document.getElementById("result-class").textContent = getIpClass(ipInput);
    document.getElementById("result-type").textContent = getAddressType(
      ipInput,
      networkIp,
      broadcastIp,
    );

    document.getElementById("result-binary-ip").textContent =
      `IP:      ${longToBinaryString(ipLong)}`;
    document.getElementById("result-binary-mask").textContent =
      `Mask:    ${longToBinaryString(mask)}`;
    document.getElementById("result-binary-network").textContent =
      `Network: ${longToBinaryString(networkLong)}`;

    document.getElementById("results").classList.remove("d-none");
  }

  function clearResults() {
    document.getElementById("ip-address").value = "";
    document.getElementById("cidr").value = "16";
    document.getElementById("results").classList.add("d-none");
  }

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

  function init() {
    document.getElementById("subnet-form").addEventListener("submit", (e) => {
      e.preventDefault();
      calculateSubnet();
    });

    document
      .getElementById("clear-btn")
      .addEventListener("click", clearResults);
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
