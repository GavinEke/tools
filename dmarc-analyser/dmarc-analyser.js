(() => {
  const inputDmarc = document.getElementById('input-dmarc');
  const analyseBtn = document.getElementById('analyse-btn');
  const clearBtn = document.getElementById('clear-btn');
  const outputSection = document.getElementById('output-section');
  const resultsDiv = document.getElementById('results');

  // Parse DMARC XML report
  function parseDmarcXml(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML: ' + parserError.textContent);
    }

    const feedback = xmlDoc.querySelector('feedback');
    if (!feedback) {
      throw new Error('Invalid DMARC report: missing feedback element');
    }

    const report = {};

    // Report metadata
    const metadata = feedback.querySelector('report_metadata');
    if (metadata) {
      report.metadata = {
        org_name: metadata.querySelector('org_name')?.textContent || '',
        email: metadata.querySelector('email')?.textContent || '',
        extra_contact_info: metadata.querySelector('extra_contact_info')?.textContent || '',
        report_id: metadata.querySelector('report_id')?.textContent || '',
        date_range: {
          begin: metadata.querySelector('date_range begin')?.textContent || '',
          end: metadata.querySelector('date_range end')?.textContent || ''
        }
      };
    }

    // Policy published
    const policy = feedback.querySelector('policy_published');
    if (policy) {
      report.policy = {
        domain: policy.querySelector('domain')?.textContent || '',
        adkim: policy.querySelector('adkim')?.textContent || '',
        aspf: policy.querySelector('aspf')?.textContent || '',
        p: policy.querySelector('p')?.textContent || '',
        sp: policy.querySelector('sp')?.textContent || '',
        pct: policy.querySelector('pct')?.textContent || '',
        fo: policy.querySelector('fo')?.textContent || ''
      };
    }

    // Records
    const records = feedback.querySelectorAll('record');
    report.records = Array.from(records).map(record => {
      const row = record.querySelector('row');
      const identifiers = record.querySelector('identifiers');
      const auth_results = record.querySelector('auth_results');

      return {
        row: {
          source_ip: row?.querySelector('source_ip')?.textContent || '',
          count: row?.querySelector('count')?.textContent || '',
          policy_evaluated: {
            disposition: row?.querySelector('policy_evaluated disposition')?.textContent || '',
            dkim: row?.querySelector('policy_evaluated dkim')?.textContent || '',
            spf: row?.querySelector('policy_evaluated spf')?.textContent || ''
          }
        },
        identifiers: {
          header_from: identifiers?.querySelector('header_from')?.textContent || '',
          envelope_from: identifiers?.querySelector('envelope_from')?.textContent || '',
          envelope_to: identifiers?.querySelector('envelope_to')?.textContent || ''
        },
        auth_results: {
          dkim: Array.from(auth_results?.querySelectorAll('dkim') || []).map(dkim => ({
            domain: dkim.querySelector('domain')?.textContent || '',
            result: dkim.querySelector('result')?.textContent || '',
            selector: dkim.querySelector('selector')?.textContent || ''
          })),
          spf: Array.from(auth_results?.querySelectorAll('spf') || []).map(spf => ({
            domain: spf.querySelector('domain')?.textContent || '',
            result: spf.querySelector('result')?.textContent || '',
            scope: spf.querySelector('scope')?.textContent || ''
          }))
        }
      };
    });

    return report;
  }

  // Render results
  function renderResults(report) {
    let html = '';

    // Metadata
    if (report.metadata) {
      html += '<h6>Report Metadata</h6>';
      html += '<div class="table-responsive mb-4"><table class="table table-sm"><tbody>';
      html += `<tr><td><strong>Organization</strong></td><td>${report.metadata.org_name}</td></tr>`;
      html += `<tr><td><strong>Email</strong></td><td>${report.metadata.email}</td></tr>`;
      html += `<tr><td><strong>Report ID</strong></td><td>${report.metadata.report_id}</td></tr>`;
      html += `<tr><td><strong>Date Range</strong></td><td>${new Date(parseInt(report.metadata.date_range.begin) * 1000).toLocaleString()} - ${new Date(parseInt(report.metadata.date_range.end) * 1000).toLocaleString()}</td></tr>`;
      html += '</tbody></table></div>';
    }

    // Policy
    if (report.policy) {
      html += '<h6>Policy Published</h6>';
      html += '<div class="table-responsive mb-4"><table class="table table-sm"><tbody>';
      html += `<tr><td><strong>Domain</strong></td><td>${report.policy.domain}</td></tr>`;
      html += `<tr><td><strong>DKIM Alignment</strong></td><td>${report.policy.adkim}</td></tr>`;
      html += `<tr><td><strong>SPF Alignment</strong></td><td>${report.policy.aspf}</td></tr>`;
      html += `<tr><td><strong>Policy</strong></td><td>${report.policy.p}</td></tr>`;
      html += `<tr><td><strong>Subdomain Policy</strong></td><td>${report.policy.sp || report.policy.p}</td></tr>`;
      html += `<tr><td><strong>Percentage</strong></td><td>${report.policy.pct || '100'}%</td></tr>`;
      html += '</tbody></table></div>';
    }

    // Records
    if (report.records && report.records.length > 0) {
      html += '<h6>Records</h6>';
      html += '<div class="table-responsive"><table class="table table-striped table-sm"><thead><tr>';
      html += '<th>Source IP</th><th>Count</th><th>Disposition</th><th>DKIM</th><th>SPF</th><th>Header From</th>';
      html += '</tr></thead><tbody>';

      report.records.forEach(rec => {
        const dkimResults = rec.auth_results.dkim.map(d => `${d.result} (${d.domain})`).join(', ');
        const spfResults = rec.auth_results.spf.map(s => `${s.result} (${s.domain})`).join(', ');

        html += `<tr>`;
        html += `<td>${rec.row.source_ip}</td>`;
        html += `<td>${rec.row.count}</td>`;
        html += `<td>${rec.row.policy_evaluated.disposition}</td>`;
        html += `<td>${dkimResults || 'N/A'}</td>`;
        html += `<td>${spfResults || 'N/A'}</td>`;
        html += `<td>${rec.identifiers.header_from}</td>`;
        html += `</tr>`;
      });

      html += '</tbody></table></div>';
    }

    resultsDiv.innerHTML = html;
  }

  // Event listeners
  analyseBtn.addEventListener('click', () => {
    const xmlText = inputDmarc.value.trim();
    if (!xmlText) return;

    try {
      const report = parseDmarcXml(xmlText);
      renderResults(report);
      outputSection.classList.remove('d-none');
      outputSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      resultsDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      outputSection.classList.remove('d-none');
      outputSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  clearBtn.addEventListener('click', () => {
    inputDmarc.value = '';
    resultsDiv.innerHTML = '';
    outputSection.classList.add('d-none');
  });
})();