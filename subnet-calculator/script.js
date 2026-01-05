function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function intToIp(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join('.');
}

function cidrToMask(cidr) {
    return (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

function maskToInt(mask) {
    return cidrToMask(mask);
}

function validateIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        const num = Number(part);
        return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
    });
}

function calculateSubnet(ip, cidr) {
    const ipInt = ipToInt(ip);
    const mask = cidrToMask(cidr);
    const maskInt = maskToInt(cidr);

    const networkInt = ipInt & mask;
    const broadcastInt = ipInt | (~mask & 0xFFFFFFFF);

    let numHosts;
    if (cidr === 32) {
        numHosts = 1;
    } else if (cidr === 31) {
        numHosts = 2;
    } else {
        numHosts = (1 << (32 - cidr)) - 2;
    }

    let hostRange;
    if (cidr === 32) {
        hostRange = ip;
    } else if (cidr === 31) {
        hostRange = `${intToIp(networkInt)} - ${intToIp(broadcastInt)}`;
    } else if (cidr === 0) {
        hostRange = '0.0.0.0 - 255.255.255.255';
    } else {
        const hostMin = intToIp(networkInt + 1);
        const hostMax = intToIp(broadcastInt - 1);
        hostRange = `${hostMin} - ${hostMax}`;
    }

    return {
        networkAddress: intToIp(networkInt),
        broadcastAddress: intToIp(broadcastInt),
        subnetMask: intToIp(maskInt),
        hostRange: hostRange,
        numberOfHosts: numHosts.toLocaleString()
    };
}

function showError(message) {
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    resultEl.classList.remove('show');
}

function showResult(result) {
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    errorEl.classList.remove('show');
    resultEl.classList.add('show');

    document.getElementById('network').textContent = result.networkAddress;
    document.getElementById('broadcast').textContent = result.broadcastAddress;
    document.getElementById('mask').textContent = result.subnetMask;
    document.getElementById('range').textContent = result.hostRange;
    document.getElementById('hosts').textContent = result.numberOfHosts;
}

document.getElementById('calculate').addEventListener('click', function() {
    const ipInput = document.getElementById('ip').value.trim();
    const cidrInput = document.getElementById('cidr').value.trim();

    if (!ipInput) {
        showError('Please enter an IP address');
        return;
    }

    if (!validateIp(ipInput)) {
        showError('Invalid IP address format. Use format: x.x.x.x (0-255 each octet)');
        return;
    }

    const cidr = parseInt(cidrInput);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
        showError('CIDR must be a number between 0 and 32');
        return;
    }

    const result = calculateSubnet(ipInput, cidr);
    showResult(result);
});

document.getElementById('ip').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('calculate').click();
    }
});

document.getElementById('cidr').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('calculate').click();
    }
});
