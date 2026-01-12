(() => {
    const domainInput = document.getElementById('domainInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const resultsDiv = document.getElementById('results');

    const performLookup = () => {
        const domain = domainInput.value.trim();
        if (!domain) {
            displayError('Please enter a domain');
            return;
        }
        lookup(domain);
    };

    lookupBtn.addEventListener('click', performLookup);
    domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performLookup();
        }
    });

    async function lookup(domain) {
        resultsDiv.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
        const tld = domain.toLowerCase().split('.').pop();
        try {
            const bootstrapRes = await fetch(`https://rdap.iana.org/domain/${tld}`);
            if (!bootstrapRes.ok) throw new Error('TLD not supported');
            const bootstrapData = await bootstrapRes.json();
            let baseUrl;
            if (bootstrapData.services && bootstrapData.services.length > 0) {
                baseUrl = bootstrapData.services[0][0];
            } else if (bootstrapData.links) {
                const rdapLink = bootstrapData.links.find(link => link.title === 'RDAP Server');
                if (rdapLink) {
                    baseUrl = rdapLink.href;
                }
            }
            if (!baseUrl) throw new Error('No RDAP service for this TLD');
            const domainRes = await fetch(`${baseUrl}domain/${domain}`);
            if (!domainRes.ok) {
                if (domainRes.status === 404) throw new Error('Domain not found');
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
        const created = findEventDate(data.events, 'registration');
        const expires = findEventDate(data.events, 'expiration');
        const nameservers = data.nameservers ? data.nameservers.map(ns => ns.ldhName || ns.unicodeName).join(', ') : 'N/A';
        const status = data.status ? data.status.map(s => s.status || s).join(', ') : 'N/A';

        const html = `
            <div class="card">
                <div class="card-header">WHOIS Results for ${domainName}</div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item"><strong>Domain:</strong> ${domainName}</li>
                        <li class="list-group-item"><strong>Registrar:</strong> ${registrar}</li>
                        <li class="list-group-item"><strong>Created:</strong> ${created}</li>
                        <li class="list-group-item"><strong>Expires:</strong> ${expires}</li>
                        <li class="list-group-item"><strong>Nameservers:</strong> ${nameservers}</li>
                        <li class="list-group-item"><strong>Status:</strong> ${status}</li>
                    </ul>
                </div>
            </div>
        `;
        resultsDiv.innerHTML = html;
    }

    function findRegistrar(entities) {
        if (!entities) return 'N/A';
        for (const entity of entities) {
            if (entity.roles && entity.roles.includes('registrar')) {
                if (entity.vcard) {
                    for (const vcardItem of entity.vcard) {
                        if (vcardItem[0] === 'fn') {
                            return vcardItem[3];
                        }
                    }
                }
                return entity.handle || 'Unknown';
            }
        }
        return 'N/A';
    }

    function findEventDate(events, action) {
        if (!events) return 'N/A';
        for (const event of events) {
            if (event.eventAction === action) {
                return new Date(event.eventDate).toLocaleDateString();
            }
        }
        return 'N/A';
    }

    function displayError(message) {
        resultsDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
})();