(() => {
  const OSV_API_BASE = 'https://api.osv.dev/v1';

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  }

  let parsedLockfile = null;

  function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('error').classList.add('d-none');
    document.getElementById('summary').classList.add('d-none');
    document.getElementById('vulnerabilities').classList.add('d-none');
    document.getElementById('no-vulnerabilities').classList.add('d-none');
  }

  function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
  }

  function showError(message) {
    hideLoading();
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
  }

  function extractPackages(lockfile) {
    const packages = new Map();

    if (lockfile.packages) {
      for (const [name, pkg] of Object.entries(lockfile.packages)) {
        const version = pkg.version || '';
        if (version && name !== '') {
          const cleanName = name.replace(/^node_modules\//, '');
          packages.set(cleanName, version);
        }
      }
    }

    if (lockfile.dependencies) {
      for (const [name, pkg] of Object.entries(lockfile.dependencies)) {
        const version = pkg.version || '';
        if (version && !packages.has(name)) {
          const cleanName = name.replace(/^node_modules\//, '');
          packages.set(cleanName, version);
        }
      }
    }

    return packages;
  }

  function parsePackageName(name) {
    const scopeMatch = name.match(/^@([^/]+)\/(.+)$/);
    if (scopeMatch) {
      return { ecosystem: 'npm', name: name, scope: scopeMatch[1], packageName: scopeMatch[2] };
    }
    return { ecosystem: 'npm', name: name, scope: null, packageName: name };
  }

  function buildQuery(name, version) {
    const pkg = parsePackageName(name);
    const query = {
      package: {
        name: pkg.packageName,
        ecosystem: pkg.ecosystem
      },
      version: version
    };

    if (pkg.scope) {
      query.package.name = `@${pkg.scope}/${pkg.packageName}`;
    }

    return query;
  }

  async function checkVulnerabilitiesBatch(queries) {
    try {
      const response = await fetch(`${OSV_API_BASE}/querybatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Batch query error:', error);
      return null;
    }
  }

  async function getVulnerabilityDetails(vulnId) {
    try {
      const response = await fetch(`${OSV_API_BASE}/vulns/${vulnId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching vuln details for ${vulnId}:`, error);
      return null;
    }
  }

  async function fetchAllVulnerabilityDetails(vulnerablePackages) {
    const enrichedResults = [];

    for (const { name, version, vulns } of vulnerablePackages) {
      const enrichedVulns = [];

      for (const vuln of vulns) {
        const details = await getVulnerabilityDetails(vuln.id);
        enrichedVulns.push({
          ...vuln,
          details: details || null
        });
      }

      enrichedResults.push({ name, version, vulns: enrichedVulns });
    }

    return enrichedResults;
  }

  async function analyzeVulnerabilities() {
    const jsonInput = document.getElementById('json-input').value.trim();

    if (!jsonInput) {
      showError('Please paste your package-lock.json content or upload a file.');
      return;
    }

    try {
      parsedLockfile = JSON.parse(jsonInput);
    } catch (e) {
      showError('Invalid JSON. Please check the format of your package-lock.json.');
      return;
    }

    showLoading();

    const packages = extractPackages(parsedLockfile);
    const packageArray = Array.from(packages.entries());

    if (packageArray.length === 0) {
      showError('No packages found in the package-lock.json file.');
      return;
    }

    const allResults = [];
    const batchSize = 1000;

    for (let i = 0; i < packageArray.length; i += batchSize) {
      const batch = packageArray.slice(i, i + batchSize);
      const queries = batch.map(([name, version]) => buildQuery(name, version));

      const batchResults = await checkVulnerabilitiesBatch(queries);

      if (batchResults === null) {
        showError('Failed to query the OSV API. Please try again.');
        return;
      }

      for (let j = 0; j < batch.length; j++) {
        const [name, version] = batch[j];
        const result = batchResults[j];
        const vulns = result && Array.isArray(result.vulns) ? result.vulns : [];
        allResults.push({ name, version, vulns });
      }

      const checked = Math.min(i + batchSize, packageArray.length);
      document.getElementById('loading').querySelector('p').textContent =
        `Checked ${checked} of ${packageArray.length} packages...`;
    }

    hideLoading();

    const vulnerablePackages = allResults.filter(r => {
      const hasVulns = r.vulns && r.vulns.length > 0;
      return hasVulns;
    });
    const safeCount = allResults.length - vulnerablePackages.length;

    document.getElementById('total-packages').textContent = allResults.length;
    document.getElementById('safe-packages').textContent = safeCount;
    document.getElementById('vulnerable-packages').textContent = vulnerablePackages.length;
    document.getElementById('summary').classList.remove('d-none');

    if (vulnerablePackages.length === 0) {
      document.getElementById('no-vulnerabilities').classList.remove('d-none');
      return;
    }

    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('loading').querySelector('p').textContent = 'Fetching vulnerability details...';

    const enrichedResults = await fetchAllVulnerabilityDetails(vulnerablePackages);

    hideLoading();

    const vulnList = document.getElementById('vuln-list');
    vulnList.innerHTML = '';

    for (const { name, version, vulns } of enrichedResults) {
      for (const vuln of vulns) {
        const details = vuln.details || {};
        const severityArray = details.severity || [];
        const severityObj = severityArray.length > 0 ? severityArray[0] : {};
        const severity = details.database_specific?.severity || severityObj.score || severityObj.type || vuln.severity || 'UNKNOWN';
        const severityUpper = severity.toUpperCase();
        const severityBadge = severityUpper === 'CRITICAL' ? 'severity-critical' :
          severityUpper === 'HIGH' ? 'severity-high' :
            severityUpper === 'MODERATE' ? 'severity-medium' : 'severity-low';
        const published = details.published || vuln.published ? new Date(details.published || vuln.published).toLocaleDateString() : 'Unknown';
        const modified = details.modified ? new Date(details.modified).toLocaleDateString() : 'Unknown';
        const summary = details.summary || vuln.summary || 'No summary available';
        const description = details.description || '';
        const affected = details.affected || [];

        const githubAdvisoryUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/security\/advisories\//;
        const references = (details.references || vuln.references || []).filter(ref =>
          ref.type === 'ADVISORY' || (ref.type === 'WEB' && githubAdvisoryUrlPattern.test(ref.url))
        );

        const affectedRanges = affected.length > 0
          ? affected.map(a => {
            const packageName = a.package?.name || name;
            const ranges = a.ranges || [];
            return ranges.map(r => {
              if (r.type === 'ECOSYSTEM' && r.events) {
                const events = r.events.map(e => {
                  if (e.introduced) return `introduced: ${e.introduced}`;
                  if (e.fixed) return `fixed: ${e.fixed}`;
                  if (e.limit) return `limit: ${e.limit}`;
                  return '';
                }).filter(Boolean).join(', ');
                return events ? `\`${packageName}\`: ${events}` : `\`${packageName}\``;
              }
              return '';
            }).filter(Boolean).join('<br>');
          }).filter(Boolean).join('<br>')
          : '';

        const cwe = details.database_specific?.cwe || '';
        const cvss = details.database_specific?.cvss?.vector_string || '';
        const githubReviewStatus = details.database_specific?.github_review_status || '';

        const item = document.createElement('div');
        item.className = 'list-group-item';

        item.innerHTML = `
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h5 class="mb-1">
                <span class="badge bg-${severityBadge}">${escapeHtml(severity)}</span>
                ${escapeHtml(name)}@${escapeHtml(version)}
              </h5>
              <p class="mb-2 text-body-secondary">${escapeHtml(summary)}</p>
              ${description ? `<div class="mb-2 small text-body-secondary" style="max-height: 150px; overflow-y: auto;">${escapeHtml(description)}</div>` : ''}
              <div class="mb-2">
                <small class="text-muted d-block">ID: ${escapeHtml(vuln.id)}</small>
                <small class="text-muted d-block">Published: ${escapeHtml(published)} | Modified: ${escapeHtml(modified)}</small>
                ${cwe ? `<small class="text-muted d-block">CWE: ${escapeHtml(cwe)}</small>` : ''}
                ${cvss ? `<small class="text-muted d-block">CVSS: ${escapeHtml(cvss)}</small>` : ''}
                ${githubReviewStatus ? `<small class="text-muted d-block">Review Status: ${escapeHtml(githubReviewStatus)}</small>` : ''}
              </div>
              ${affectedRanges ? `<div class="mb-2"><small class="text-muted text-uppercase small fw-bold">Affected Versions:</small><br><small class="text-muted">${affectedRanges}</small></div>` : ''}
              ${references.length > 0 ? `
                <div class="mt-2">
                  ${references.slice(0, 3).map(ref =>
          `<a href="${ref.url}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary me-1 mb-1">${escapeHtml(ref.type || 'Reference')}</a>`
        ).join('')}
                </div>
              ` : ''}
            </div>
            ${details.fixed_version ? `<span class="badge bg-success ms-2">Fixed: ${escapeHtml(details.fixed_version)}</span>` : ''}
          </div>
        `;
        vulnList.appendChild(item);
      }
    }

    document.getElementById('vulnerabilities').classList.remove('d-none');
  }

  function clearAll() {
    document.getElementById('json-input').value = '';
    document.getElementById('file-upload').value = '';
    document.getElementById('error').classList.add('d-none');
    document.getElementById('summary').classList.add('d-none');
    document.getElementById('vulnerabilities').classList.add('d-none');
    document.getElementById('no-vulnerabilities').classList.add('d-none');
    parsedLockfile = null;
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('json-input').value = e.target.result;
    };
    reader.readAsText(file);
  }

  function init() {
    document.getElementById('analyze-btn').addEventListener('click', analyzeVulnerabilities);
    document.getElementById('clear-btn').addEventListener('click', clearAll);
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);

    document.getElementById('json-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        analyzeVulnerabilities();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
