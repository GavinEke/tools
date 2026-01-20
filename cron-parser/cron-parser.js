(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const form = document.getElementById("cronForm");
  const results = document.getElementById("results");
  const validation = document.getElementById("validation");
  const explanationBody = document.getElementById("explanationBody");
  const nextRunsBody = document.getElementById("nextRunsBody");

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const expression = document.getElementById("cronInput").value.trim();
    parseCron(expression);
  });

  function parseCron(expression) {
    const fields = expression.split(/\s+/).slice(0, 5);
    if (fields.length !== 5) {
      showError("Invalid cron expression: must have at least 5 fields");
      return;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

    if (!validateCron(fields)) {
      return;
    }

    const explanation = explainCron(fields);
    const nextRuns = getNextRuns(fields, 5);

    explanationBody.innerHTML = explanation;
    nextRunsBody.innerHTML = nextRuns
      .map((time) => `<li>${time}</li>`)
      .join("");
  }

  function validateCron(fields) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
    const ranges = [
      { name: "minute", min: 0, max: 59 },
      { name: "hour", min: 0, max: 23 },
      { name: "day of month", min: 1, max: 31 },
      { name: "month", min: 1, max: 12 },
      { name: "day of week", min: 0, max: 7 }, // 0 and 7 are Sunday
    ];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const { name, min, max } = ranges[i];
      const values = expandField(field, min, max);
      if (values.length === 0) {
        showError(`Invalid ${name} field: ${field}`);
        return false;
      }
    }
    showSuccess("Valid cron expression");
    const explanation = explainCron(fields);
    const nextRuns = getNextRuns(fields, 5);

    explanationBody.innerHTML = explanation;
    nextRunsBody.innerHTML = nextRuns
      .map((time) => `<li>${time}</li>`)
      .join("");
    results.classList.remove("d-none");
  }

  function showError(message) {
    validation.className = "alert alert-danger";
    validation.textContent = message;
    results.classList.remove("d-none");
  }

  function showSuccess(message) {
    validation.className = "alert alert-success";
    validation.textContent = message;
  }

  function expandField(field, min, max) {
    const parts = field.split(",");
    const values = new Set();

    for (const part of parts) {
      if (part === "*") {
        for (let i = min; i <= max; i++) values.add(i);
      } else if (part.includes("/")) {
        const [range, step] = part.split("/");
        const stepNum = parseInt(step);
        if (isNaN(stepNum) || stepNum <= 0) return [];
        const baseValues = expandField(range, min, max);
        for (const val of baseValues) {
          if (val % stepNum === 0) values.add(val);
        }
      } else if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (isNaN(start) || isNaN(end) || start > end) return [];
        for (let i = start; i <= end; i++) {
          if (i >= min && i <= max) values.add(i);
        }
      } else {
        const num = Number(part);
        if (isNaN(num) || num < min || num > max) return [];
        values.add(num);
      }
    }
    return Array.from(values).sort((a, b) => a - b);
  }

  function explainCron(fields) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
    const fieldDetails = [
      { name: "Minute", values: expandField(minute, 0, 59) },
      { name: "Hour", values: expandField(hour, 0, 23) },
      { name: "Day of Month", values: expandField(dayOfMonth, 1, 31) },
      {
        name: "Month",
        values: expandField(month, 1, 12).map(
          (m) =>
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ][m - 1],
        ),
      },
      {
        name: "Day of Week",
        values: expandField(dayOfWeek, 0, 7)
          .map((d) => (d === 7 ? 0 : d))
          .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]),
      },
    ];

    return fieldDetails
      .map(
        ({ name, values }) => `<strong>${name}:</strong> ${values.join(", ")}`,
      )
      .join("<br>");
  }

  function getNextRuns(fields, count) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
    const minuteSet = new Set(expandField(minute, 0, 59));
    const hourSet = new Set(expandField(hour, 0, 23));
    const dayOfMonthSet = new Set(expandField(dayOfMonth, 1, 31));
    const monthSet = new Set(expandField(month, 1, 12));
    const dayOfWeekSet = new Set(
      expandField(dayOfWeek, 0, 7).map((d) => (d === 7 ? 0 : d)),
    );

    const runs = [];

    let current = new Date();

    for (let i = 0; i < count; i++) {
      current = findNext(
        current,
        minuteSet,
        hourSet,
        dayOfMonthSet,
        monthSet,
        dayOfWeekSet,
      );
      runs.push(current.toLocaleString());
      current = new Date(current.getTime() + 60000); // add 1 minute
    }

    return runs;
  }

  function findNext(
    start,
    minuteSet,
    hourSet,
    dayOfMonthSet,
    monthSet,
    dayOfWeekSet,
  ) {
    let date = new Date(start);

    while (true) {
      const minute = date.getMinutes();
      const hour = date.getHours();
      const day = date.getDate();
      const month = date.getMonth() + 1; // 0-based
      const dayOfWeek = date.getDay(); // 0 = Sunday

      if (
        monthSet.has(month) &&
        (dayOfMonthSet.has(day) || dayOfWeekSet.has(dayOfWeek)) &&
        hourSet.has(hour) &&
        minuteSet.has(minute)
      ) {
        return date;
      }

      date = new Date(date.getTime() + 60000); // next minute
    }
  }

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
