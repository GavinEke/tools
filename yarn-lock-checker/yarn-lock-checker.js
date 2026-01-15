(function () {
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
    document.getElementById('loading').scrollIntoView({ behavior: 'smooth' });
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
    const packages = new Map(); // name -> Set of versions

    const lines = lockfile.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (line.includes(':') && !rawLine.startsWith('  ') && !rawLine.startsWith('\t')) {
        // This is a package spec line
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          let spec = line.substring(0, colonIndex).trim();
          // Remove quotes if present (Yarn v2+ format)
          spec = spec.replace(/^"/, '').replace(/"$/, '');
          // Extract name from spec, handling Yarn v1 and v2+ formats
          const atParts = spec.split('@');
          let name;
          if (atParts[0] === '') {
            // Scoped package: ["", "scope/package", "npm:version"] -> "@scope/package"
            name = '@' + atParts[1];
          } else {
            // Non-scoped package: ["package", "npm:version"] or ["package", "version"] -> "package"
            name = atParts[0];
          }

          // Now find the version in the next indented lines
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j];
            const trimmed = nextLine.trim();

            // stop when we reach a non-indented line (next package) or blank line
            if (trimmed === '' || !nextLine.startsWith(' ')) break;

            if (trimmed.startsWith('version ')) {
              // Yarn v1 format: version "4.4.3"
              const versionMatch = trimmed.match(/version "([^"]+)"/);
              if (versionMatch) {
                const version = versionMatch[1];
                if (!packages.has(name)) packages.set(name, new Set());
                packages.get(name).add(version);
                break;
              }
            } else if (trimmed.startsWith('version:')) {
              // Yarn v2+ format: version: 4.4.3
              const versionMatch = trimmed.match(/version:\s*(.+)/);
              if (versionMatch) {
                const version = versionMatch[1].trim();
                if (!packages.has(name)) packages.set(name, new Set());
                packages.get(name).add(version);
                break;
              }
            }
          }
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
    const lockInput = document.getElementById('lock-input').value.trim();

    if (!lockInput) {
      showError('Please paste your yarn.lock content or upload a file.');
      return;
    }

    parsedLockfile = lockInput;

    showLoading();

    const packages = extractPackages(parsedLockfile);
    const allPackages = [];
    for (const [name, versions] of packages) {
      for (const version of versions) {
        allPackages.push({ name, version });
      }
    }

    if (allPackages.length === 0) {
      showError('No packages found in the yarn.lock file.');
      return;
    }

    const allResults = [];
    const batchSize = 1000;

    for (let i = 0; i < allPackages.length; i += batchSize) {
      const batch = allPackages.slice(i, i + batchSize);
      const queries = batch.map(({ name, version }) => buildQuery(name, version));
      console.log('Sending queries:', queries);

      const batchResults = await checkVulnerabilitiesBatch(queries);

      if (batchResults === null) {
        showError('Failed to query the OSV API. Please try again.');
        return;
      }

      for (let j = 0; j < batch.length; j++) {
        const { name, version } = batch[j];
        const result = batchResults[j];
        const vulns = result && Array.isArray(result.vulns) ? result.vulns : [];
        allResults.push({ name, version, vulns });
      }

      const checked = Math.min(i + batchSize, allPackages.length);
      document.getElementById('loading').querySelector('p').textContent =
        `Checked ${checked} of ${allPackages.length} packages...`;
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

        const cwe = details.cwe || vuln.cwe;
        const cvss = details.cvss || vuln.cvss;
        const githubReviewStatus = details.database_specific?.github_review_status || vuln.database_specific?.github_review_status;
        const references = details.references || vuln.references || [];
        const affectedRanges = affected.length > 0 ? affected.map(a => {
          const ranges = a.ranges || [];
          return ranges.map(r => {
            const events = r.events || [];
            const introduced = events.find(e => e.introduced)?.introduced;
            const fixed = events.find(e => e.fixed)?.fixed;
            let rangeStr = '';
            if (introduced) rangeStr += `>=${introduced}`;
            if (fixed) rangeStr += ` <${fixed}`;
            return rangeStr.trim();
          }).join(', ');
        }).join('<br>') : '';
        const githubAdvisoryUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/security\/advisories\//;
        const filteredReferences = references.filter(ref => (ref.type === 'ADVISORY' || ref.type === 'WEB') && githubAdvisoryUrlPattern.test(ref.url));

        const item = document.createElement('div');
        item.className = 'list-group-item';

        const mainDiv = document.createElement('div');
        mainDiv.className = 'd-flex justify-content-between align-items-start';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow-1';

        // Header with severity badge and package info
        const header = document.createElement('h5');
        header.className = 'mb-1';

        const severityBadgeEl = document.createElement('span');
        severityBadgeEl.className = `badge bg-${severityBadge}`;
        severityBadgeEl.textContent = severity;

        header.appendChild(severityBadgeEl);
        header.appendChild(document.createTextNode(` ${name}@${version}`));

        contentDiv.appendChild(header);

        // Summary
        const summaryP = document.createElement('p');
        summaryP.className = 'mb-2 text-body-secondary';
        summaryP.textContent = summary;
        contentDiv.appendChild(summaryP);

        // Description (if available)
        if (description) {
          const descDiv = document.createElement('div');
          descDiv.className = 'mb-2 small text-body-secondary';
          descDiv.style.maxHeight = '150px';
          descDiv.style.overflowY = 'auto';
          descDiv.textContent = description;
          contentDiv.appendChild(descDiv);
        }

        // Details section
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'mb-2';

        const idSmall = document.createElement('small');
        idSmall.className = 'text-muted d-block';
        idSmall.textContent = `ID: ${vuln.id}`;
        detailsDiv.appendChild(idSmall);

        const datesSmall = document.createElement('small');
        datesSmall.className = 'text-muted d-block';
        datesSmall.textContent = `Published: ${published} | Modified: ${modified}`;
        detailsDiv.appendChild(datesSmall);

        if (cwe) {
          const cweSmall = document.createElement('small');
          cweSmall.className = 'text-muted d-block';
          cweSmall.textContent = `CWE: ${cwe}`;
          detailsDiv.appendChild(cweSmall);
        }

        if (cvss) {
          const cvssSmall = document.createElement('small');
          cvssSmall.className = 'text-muted d-block';
          cvssSmall.textContent = `CVSS: ${cvss}`;
          detailsDiv.appendChild(cvssSmall);
        }

        if (githubReviewStatus) {
          const reviewSmall = document.createElement('small');
          reviewSmall.className = 'text-muted d-block';
          reviewSmall.textContent = `Review Status: ${githubReviewStatus}`;
          detailsDiv.appendChild(reviewSmall);
        }

        contentDiv.appendChild(detailsDiv);

        // Affected versions
        if (affectedRanges) {
          const affectedDiv = document.createElement('div');
          affectedDiv.className = 'mb-2';

          const affectedLabel = document.createElement('small');
          affectedLabel.className = 'text-muted text-uppercase small fw-bold';
          affectedLabel.textContent = 'Affected Versions:';
          affectedDiv.appendChild(affectedLabel);
          affectedDiv.appendChild(document.createElement('br'));

          const affectedText = document.createElement('small');
          affectedText.className = 'text-muted';
          // Split by <br> and create separate elements
          const ranges = affectedRanges.split('<br>');
          ranges.forEach((range, index) => {
            if (index > 0) {
              affectedText.appendChild(document.createElement('br'));
            }
            affectedText.appendChild(document.createTextNode(range));
          });
          affectedDiv.appendChild(affectedText);

          contentDiv.appendChild(affectedDiv);
        }

        // References
        if (filteredReferences.length > 0) {
          const refDiv = document.createElement('div');
          refDiv.className = 'mt-2';

          filteredReferences.slice(0, 3).forEach(ref => {
            const link = document.createElement('a');
            link.href = ref.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'btn btn-sm btn-outline-primary me-1 mb-1';
            link.textContent = ref.type || 'Reference';
            refDiv.appendChild(link);
          });

          contentDiv.appendChild(refDiv);
        }

        mainDiv.appendChild(contentDiv);

        // Fixed version badge
        if (details.fixed_version) {
          const fixedBadge = document.createElement('span');
          fixedBadge.className = 'badge bg-success ms-2';
          fixedBadge.textContent = `Fixed: ${details.fixed_version}`;
          mainDiv.appendChild(fixedBadge);
        }

        item.appendChild(mainDiv);
        vulnList.appendChild(item);
      }
    }

    document.getElementById('vulnerabilities').classList.remove('d-none');
  }

  function clearAll() {
    document.getElementById('lock-input').value = '';
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
      document.getElementById('lock-input').value = e.target.result;
    };
    reader.readAsText(file);
  }

  function init() {
    document.getElementById('analyze-btn').addEventListener('click', analyzeVulnerabilities);
    document.getElementById('clear-btn').addEventListener('click', clearAll);
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);

    document.getElementById('lock-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        analyzeVulnerabilities();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();