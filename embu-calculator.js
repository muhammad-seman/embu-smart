let matches = [];
let currentMatchId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    if (matches.length === 0) {
        addNewMatch();
    }
    renderTabs();
    renderMatches();
});

// Match Management
function addNewMatch() {
    const matchId = Date.now();
    const matchNumber = matches.length + 1;

    matches.push({
        id: matchId,
        name: `Pertandingan ${matchNumber}`,
        nomor: '',
        wasits: [
            { name: 'Wasit 1', isUtama: true },
            { name: 'Wasit 2', isUtama: false },
            { name: 'Wasit 3', isUtama: false },
            { name: 'Wasit 4', isUtama: false },
            { name: 'Wasit 5', isUtama: false }
        ],
        teams: [
            {
                name: 'Merah',
                scores: [0, 0, 0, 0, 0], // Ekspresi per wasit
                tekniks: [0, 0, 0, 0, 0], // Teknik per wasit
                durasi: '0:00',
                dendaWaktu: 0,
                dendaWaza: 0,
                manualDecision: ''
            },
            {
                name: 'Putih',
                scores: [0, 0, 0, 0, 0],
                tekniks: [0, 0, 0, 0, 0],
                durasi: '0:00',
                dendaWaktu: 0,
                dendaWaza: 0,
                manualDecision: ''
            }
        ]
    });

    currentMatchId = matchId;
    saveData();
}

function deleteMatch(matchId) {
    if (matches.length === 1) {
        alert('Tidak bisa menghapus pertandingan terakhir!');
        return;
    }

    if (confirm('Yakin ingin menghapus pertandingan ini?')) {
        matches = matches.filter(m => m.id !== matchId);
        if (currentMatchId === matchId) {
            currentMatchId = matches[0].id;
        }
        saveData();
        renderTabs();
        renderMatches();
    }
}

function renameMatch(matchId) {
    const match = matches.find(m => m.id === matchId);
    const newName = prompt('Nama pertandingan:', match.name);
    if (newName && newName.trim()) {
        match.name = newName.trim();
        saveData();
        renderTabs();
    }
}

function setCurrentMatch(matchId) {
    currentMatchId = matchId;
    renderTabs();
    renderMatches();
}

// Render Functions
function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = matches.map(match => `
        <button class="tab ${match.id === currentMatchId ? 'active' : ''}"
                onclick="setCurrentMatch(${match.id})"
                ondblclick="renameMatch(${match.id})">
            ${match.name}
            ${matches.length > 1 ? `<span class="close-tab" onclick="event.stopPropagation(); deleteMatch(${match.id})">×</span>` : ''}
        </button>
    `).join('') + '<button class="add-tab-btn" onclick="addNewMatch(); renderTabs(); renderMatches();">+ Tambah</button>';
}

function renderMatches() {
    const container = document.getElementById('matches-container');
    container.innerHTML = matches.map(match => {
        const isActive = match.id === currentMatchId;
        return `
            <div class="match-content ${isActive ? 'active' : ''}" id="match-${match.id}">
                ${renderMatchContent(match)}
            </div>
        `;
    }).join('');
}

function renderMatchContent(match) {
    return `
        <div class="header">
            <h1>KALKULATOR CANGGIH NILAI EMBU YANG SAMA</h1>
            <p style="margin-top: 10px;"><strong>Nomor: <input type="text" value="${match.nomor}"
                onchange="updateMatchNomor(${match.id}, this.value)"
                style="border: none; border-bottom: 2px solid #1e3a5f; text-align: center; width: 300px; font-size: 16px;"></strong></p>
        </div>

        ${renderWasitSection(match)}
        ${renderScoreTable(match)}
        ${renderNotes()}
    `;
}

function renderWasitSection(match) {
    return `
        <div class="wasit-section">
            <h3>Daftar Wasit (Pilih Wasit Utama)</h3>
            <div class="wasit-list">
                ${match.wasits.map((wasit, idx) => `
                    <div class="wasit-item">
                        <input type="radio" name="wasit-utama-${match.id}"
                               ${wasit.isUtama ? 'checked' : ''}
                               onchange="setWasitUtama(${match.id}, ${idx})"
                               title="Wasit Utama">
                        <input type="text" value="${wasit.name}"
                               onchange="updateWasitName(${match.id}, ${idx}, this.value)"
                               placeholder="Nama Wasit">
                        ${match.wasits.length > 5 ? `<button onclick="removeWasit(${match.id}, ${idx})">×</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <button class="add-wasit-btn" onclick="addWasit(${match.id})">+ Tambah Wasit</button>
        </div>
    `;
}

function renderScoreTable(match) {
    const results = calculateResults(match);
    const wasitUtamaIdx = match.wasits.findIndex(w => w.isUtama);

    return `
        <table class="score-table" id="table-${match.id}">
            <thead>
                <tr>
                    <th rowspan="2">NO</th>
                    <th rowspan="2">TEAM</th>
                    <th colspan="${match.wasits.length}">WASIT</th>
                    <th rowspan="2">NILAI<br>AWAL</th>
                    <th colspan="2">DENDA</th>
                    <th rowspan="2">NILAI<br>AKHIR</th>
                    <th rowspan="2">NILAI FINAL</th>
                    <th rowspan="2">JUARA</th>
                    <th rowspan="2">JUARA BY<br>WASIT<br>UTAMA</th>
                    <th rowspan="2">DURASI</th>
                </tr>
                <tr>
                    ${match.wasits.map((w, idx) => `<th style="${idx === wasitUtamaIdx ? 'background: #ff9800; color: white;' : ''}">${idx + 1}</th>`).join('')}
                    <th>WAKTU</th>
                    <th>WAZA</th>
                </tr>
            </thead>
            <tbody>
                ${match.teams.map((team, teamIdx) => renderTeamRows(match, team, teamIdx, results)).join('')}
            </tbody>
        </table>
    `;
}

function renderTeamRows(match, team, teamIdx, results) {
    const teamResult = results.teams[teamIdx];
    const wasitUtamaIdx = match.wasits.findIndex(w => w.isUtama);

    // Check if manual decision is needed
    const needsManualDecision = results.winnerClass[teamIdx] === 'draw';
    const manualDecision = team.manualDecision || '';

    return `
        <tr>
            <td rowspan="2">${teamIdx + 1}</td>
            <td class="team-header">
                <input type="text" value="${team.name}"
                       onchange="updateTeamName(${match.id}, ${teamIdx}, this.value)"
                       style="background: transparent; color: white; border: none; text-align: center; font-weight: bold;">
            </td>
            ${team.scores.map((score, idx) => `
                <td class="${teamResult.discardedIndices.includes(idx) ? 'discarded' : ''}">
                    <input type="number" value="${score}" min="0" max="40"
                           onchange="updateScore(${match.id}, ${teamIdx}, ${idx}, this.value, 'score')">
                </td>
            `).join('')}
            <td class="total-cell">${teamResult.nilaiAwalEkspresi}</td>
            <td rowspan="2">
                <input type="number" value="${team.dendaWaktu}" min="0"
                       onchange="updateDenda(${match.id}, ${teamIdx}, this.value, 'waktu')">
            </td>
            <td rowspan="2">
                <input type="number" value="${team.dendaWaza}" min="0"
                       onchange="updateDenda(${match.id}, ${teamIdx}, this.value, 'waza')">
            </td>
            <td class="total-cell" rowspan="2">${teamResult.nilaiAkhir}</td>
            <td class="final-cell" rowspan="2">${teamResult.nilaiFinal}</td>
            <td class="${results.winnerClass[teamIdx]}" rowspan="2">${results.winnerText[teamIdx]}</td>
            <td rowspan="2">
                ${needsManualDecision ? `
                    <select onchange="updateManualDecision(${match.id}, ${teamIdx}, this.value)"
                            style="width: 100%; padding: 5px; text-align: center; font-weight: bold;">
                        <option value="">-</option>
                        <option value="Winner" ${manualDecision === 'Winner' ? 'selected' : ''}>Winner</option>
                        <option value="Looser" ${manualDecision === 'Looser' ? 'selected' : ''}>Looser</option>
                    </select>
                ` : results.juaraByWasitUtama[teamIdx]}
            </td>
            <td rowspan="2">
                <input type="text" value="${team.durasi}"
                       onchange="updateDurasi(${match.id}, ${teamIdx}, this.value)"
                       placeholder="0:00">
            </td>
        </tr>
        <tr>
            <td class="team-header">Nilai Teknik</td>
            ${team.tekniks.map((teknik, idx) => `
                <td class="${teamResult.discardedIndices.includes(idx) ? 'discarded' : ''}">
                    <input type="number" value="${teknik}" min="0" max="60"
                           onchange="updateScore(${match.id}, ${teamIdx}, ${idx}, this.value, 'teknik')">
                </td>
            `).join('')}
            <td class="total-cell">${teamResult.nilaiAwalTeknik}</td>
        </tr>
    `;
}

function renderNotes() {
    return `
        <div class="notes">
            <h3>Note:</h3>
            <ol>
                <li>Isi / ketik data hanya pada kolom nilai 5 wasit, nilai teknik 5 wasit dan kolom durasi (biasanya kolom menit saja jika tidak lebih dari 2 menit).</li>
                <li>Jika sumber data dari luar (Aplikasi GMS, dsb), copas langsung data nilai wasit dan nilai tekniknya pada kolom nilai 5 wasit masing-masing team.</li>
                <li>Nilai wasit dan tekniknya yang tertinggi dan terendah akan otomatis dicoret kolomnya (warna merah hati), sisanya akan dijumlah sebagai Nilai Awal.</li>
                <li>Jika sudah digunakan, hapus data score dan teknik wasit, serta data juara, agar siap digunakan kembali.</li>
            </ol>
        </div>
    `;
}

// Calculation Logic
function calculateResults(match) {
    const results = {
        teams: [],
        winnerClass: ['', ''],
        winnerText: ['', ''],
        juaraByWasitUtama: ['', '']
    };

    const wasitUtamaIdx = match.wasits.findIndex(w => w.isUtama);

    // Calculate for each team
    match.teams.forEach((team, teamIdx) => {
        // Create array with ekspresi, teknik, and total for each wasit
        const wasitScores = team.scores.map((score, idx) => ({
            idx,
            ekspresi: parseInt(score || 0),
            teknik: parseInt(team.tekniks[idx] || 0),
            total: parseInt(score || 0) + parseInt(team.tekniks[idx] || 0)
        }));

        // Sort by ekspresi first, then by total if ekspresi is same
        const sortedWithIndex = [...wasitScores].sort((a, b) => {
            if (a.ekspresi !== b.ekspresi) {
                return a.ekspresi - b.ekspresi; // Sort by ekspresi
            }
            return a.total - b.total; // If ekspresi same, sort by total
        });

        const discardedIndices = [
            sortedWithIndex[0].idx, // lowest ekspresi (or lowest total if ekspresi same)
            sortedWithIndex[sortedWithIndex.length - 1].idx // highest ekspresi (or highest total if ekspresi same)
        ];

        // Sum middle 3 scores - SEPARATE ekspresi and teknik
        const validScoresEkspresi = team.scores.filter((_, idx) => !discardedIndices.includes(idx));
        const nilaiAwalEkspresi = validScoresEkspresi.reduce((sum, score) => sum + parseInt(score || 0), 0);

        const validTekniks = team.tekniks.filter((_, idx) => !discardedIndices.includes(idx));
        const nilaiAwalTeknik = validTekniks.reduce((sum, t) => sum + parseInt(t || 0), 0);

        const nilaiAwal = nilaiAwalEkspresi + nilaiAwalTeknik;

        // Calculate nilai akhir (after penalties) - ONLY from ekspresi
        const dendaTotal = parseInt(team.dendaWaktu || 0) + parseInt(team.dendaWaza || 0);
        const nilaiAkhir = nilaiAwalEkspresi - dendaTotal;

        // Calculate total teknik
        const totalTeknik = nilaiAwalTeknik;

        // Get wasit utama scores
        const wasitUtamaEkspresi = parseInt(team.scores[wasitUtamaIdx] || 0);
        const wasitUtamaTeknik = parseInt(team.tekniks[wasitUtamaIdx] || 0);
        const wasitUtamaTotal = wasitUtamaEkspresi + wasitUtamaTeknik;

        results.teams.push({
            nilaiAwalEkspresi,
            nilaiAwalTeknik,
            nilaiAwal,
            nilaiAkhir,
            nilaiFinal: '', // Will be set later based on comparison
            discardedIndices,
            totalTeknik,
            wasitUtamaEkspresi,
            wasitUtamaTotal,
            wasitUtamaTeknik
        });
    });

    // Determine winner and build nilaiFinal
    let team1 = results.teams[0];
    let team2 = results.teams[1];

    // Build nilaiFinal based on what level determines winner
    if (team1.nilaiAkhir !== team2.nilaiAkhir) {
        // Decided by nilai akhir - only show nilai akhir
        results.teams[0].nilaiFinal = `${team1.nilaiAkhir}`;
        results.teams[1].nilaiFinal = `${team2.nilaiAkhir}`;
    } else if (team1.totalTeknik !== team2.totalTeknik) {
        // Decided by teknik - show nilai akhir + teknik
        results.teams[0].nilaiFinal = `${team1.nilaiAkhir}/${team1.totalTeknik}`;
        results.teams[1].nilaiFinal = `${team2.nilaiAkhir}/${team2.totalTeknik}`;
    } else if (team1.wasitUtamaEkspresi !== team2.wasitUtamaEkspresi) {
        // Decided by wasit utama ekspresi - show nilai akhir + teknik + wasit utama ekspresi
        results.teams[0].nilaiFinal = `${team1.nilaiAkhir}/${team1.totalTeknik}/${team1.wasitUtamaEkspresi}`;
        results.teams[1].nilaiFinal = `${team2.nilaiAkhir}/${team2.totalTeknik}/${team2.wasitUtamaEkspresi}`;
    } else if (team1.wasitUtamaTeknik !== team2.wasitUtamaTeknik) {
        // Decided by wasit utama teknik - show all
        results.teams[0].nilaiFinal = `${team1.nilaiAkhir}/${team1.totalTeknik}/${team1.wasitUtamaEkspresi}/${team1.wasitUtamaTeknik}`;
        results.teams[1].nilaiFinal = `${team2.nilaiAkhir}/${team2.totalTeknik}/${team2.wasitUtamaEkspresi}/${team2.wasitUtamaTeknik}`;
    } else {
        // Everything same - manual decision needed
        results.teams[0].nilaiFinal = `${team1.nilaiAkhir}/${team1.totalTeknik}/${team1.wasitUtamaEkspresi}/${team1.wasitUtamaTeknik}`;
        results.teams[1].nilaiFinal = `${team2.nilaiAkhir}/${team2.totalTeknik}/${team2.wasitUtamaEkspresi}/${team2.wasitUtamaTeknik}`;
    }

    // Determine winner class
    if (team1.nilaiAkhir !== team2.nilaiAkhir) {
        // Different total scores
        if (team1.nilaiAkhir > team2.nilaiAkhir) {
            results.winnerClass = ['winner', 'loser'];
            results.winnerText = ['MENANG', 'KALAH'];
        } else {
            results.winnerClass = ['loser', 'winner'];
            results.winnerText = ['KALAH', 'MENANG'];
        }
    } else if (team1.totalTeknik !== team2.totalTeknik) {
        // Same total, different teknik
        if (team1.totalTeknik > team2.totalTeknik) {
            results.winnerClass = ['winner', 'loser'];
            results.winnerText = ['MENANG', 'KALAH'];
        } else {
            results.winnerClass = ['loser', 'winner'];
            results.winnerText = ['KALAH', 'MENANG'];
        }
    } else if (team1.wasitUtamaEkspresi !== team2.wasitUtamaEkspresi) {
        // Same total & teknik, different wasit utama ekspresi
        if (team1.wasitUtamaEkspresi > team2.wasitUtamaEkspresi) {
            results.winnerClass = ['winner', 'loser'];
            results.winnerText = ['MENANG', 'KALAH'];
        } else {
            results.winnerClass = ['loser', 'winner'];
            results.winnerText = ['KALAH', 'MENANG'];
        }
    } else if (team1.wasitUtamaTeknik !== team2.wasitUtamaTeknik) {
        // Same everything except wasit utama teknik
        if (team1.wasitUtamaTeknik > team2.wasitUtamaTeknik) {
            results.winnerClass = ['winner', 'loser'];
            results.winnerText = ['MENANG', 'KALAH'];
        } else {
            results.winnerClass = ['loser', 'winner'];
            results.winnerText = ['KALAH', 'MENANG'];
        }
    } else {
        // Everything is the same - need manual decision
        results.winnerClass = ['draw', 'draw'];
        results.winnerText = ['DITENTUKAN WASIT UTAMA', 'DITENTUKAN WASIT UTAMA'];
    }

    // Juara by wasit utama (only show when decided by wasit utama)
    if (team1.nilaiAkhir === team2.nilaiAkhir && team1.totalTeknik === team2.totalTeknik) {
        if (team1.wasitUtamaEkspresi > team2.wasitUtamaEkspresi) {
            results.juaraByWasitUtama = ['Winner', 'Looser'];
        } else if (team1.wasitUtamaEkspresi < team2.wasitUtamaEkspresi) {
            results.juaraByWasitUtama = ['Looser', 'Winner'];
        } else {
            results.juaraByWasitUtama = ['-', '-'];
        }
    } else {
        results.juaraByWasitUtama = ['-', '-'];
    }

    return results;
}

// Update Functions
function updateMatchNomor(matchId, value) {
    const match = matches.find(m => m.id === matchId);
    match.nomor = value;
    saveData();
}

function updateTeamName(matchId, teamIdx, value) {
    const match = matches.find(m => m.id === matchId);
    match.teams[teamIdx].name = value;
    saveData();
}

function updateScore(matchId, teamIdx, wasitIdx, value, type) {
    const match = matches.find(m => m.id === matchId);
    if (type === 'score') {
        match.teams[teamIdx].scores[wasitIdx] = parseInt(value || 0);
    } else {
        match.teams[teamIdx].tekniks[wasitIdx] = parseInt(value || 0);
    }
    saveData();
    renderMatches();
}

function updateDenda(matchId, teamIdx, value, type) {
    const match = matches.find(m => m.id === matchId);
    if (type === 'waktu') {
        match.teams[teamIdx].dendaWaktu = parseInt(value || 0);
    } else {
        match.teams[teamIdx].dendaWaza = parseInt(value || 0);
    }
    saveData();
    renderMatches();
}

function updateDurasi(matchId, teamIdx, value) {
    const match = matches.find(m => m.id === matchId);
    match.teams[teamIdx].durasi = value;
    saveData();
}

function updateManualDecision(matchId, teamIdx, value) {
    const match = matches.find(m => m.id === matchId);
    match.teams[teamIdx].manualDecision = value;

    // Update the other team automatically
    const otherTeamIdx = teamIdx === 0 ? 1 : 0;
    if (value === 'Winner') {
        match.teams[otherTeamIdx].manualDecision = 'Looser';
    } else if (value === 'Looser') {
        match.teams[otherTeamIdx].manualDecision = 'Winner';
    } else {
        match.teams[otherTeamIdx].manualDecision = '';
    }

    saveData();
    renderMatches();
}

function updateWasitName(matchId, wasitIdx, value) {
    const match = matches.find(m => m.id === matchId);
    match.wasits[wasitIdx].name = value;
    saveData();
    renderMatches();
}

function setWasitUtama(matchId, wasitIdx) {
    const match = matches.find(m => m.id === matchId);
    match.wasits.forEach((w, idx) => {
        w.isUtama = idx === wasitIdx;
    });
    saveData();
    renderMatches();
}

function addWasit(matchId) {
    const match = matches.find(m => m.id === matchId);
    const wasitNumber = match.wasits.length + 1;
    match.wasits.push({
        name: `Wasit ${wasitNumber}`,
        isUtama: false
    });

    // Add score slots for new wasit
    match.teams.forEach(team => {
        team.scores.push(0);
        team.tekniks.push(0);
    });

    saveData();
    renderMatches();
}

function removeWasit(matchId, wasitIdx) {
    const match = matches.find(m => m.id === matchId);
    if (match.wasits.length <= 5) {
        alert('Minimal 5 wasit diperlukan!');
        return;
    }

    const isUtama = match.wasits[wasitIdx].isUtama;
    match.wasits.splice(wasitIdx, 1);

    // Remove corresponding scores
    match.teams.forEach(team => {
        team.scores.splice(wasitIdx, 1);
        team.tekniks.splice(wasitIdx, 1);
    });

    // If removed wasit was utama, set first wasit as utama
    if (isUtama) {
        match.wasits[0].isUtama = true;
    }

    saveData();
    renderMatches();
}

// Data Persistence
function saveData() {
    localStorage.setItem('embuMatches', JSON.stringify(matches));
    localStorage.setItem('currentMatchId', currentMatchId);
}

function loadData() {
    const saved = localStorage.getItem('embuMatches');
    if (saved) {
        matches = JSON.parse(saved);
        currentMatchId = parseInt(localStorage.getItem('currentMatchId')) || matches[0]?.id;
    }
}

function clearAllData() {
    if (confirm('Yakin ingin menghapus semua data? Aksi ini tidak bisa dibatalkan!')) {
        localStorage.removeItem('embuMatches');
        localStorage.removeItem('currentMatchId');
        matches = [];
        addNewMatch();
        renderTabs();
        renderMatches();
    }
}

// Export to PDF
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        // Temporarily show the match content
        const matchElement = document.getElementById(`match-${match.id}`);
        matchElement.classList.add('active');

        // Capture as canvas
        const canvas = await html2canvas(matchElement, {
            scale: 2,
            logging: false,
            windowWidth: 1400
        });

        // Add to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 280; // A4 landscape width in mm (minus margins)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
            pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

        // Hide the match content again if it wasn't the current one
        if (match.id !== currentMatchId) {
            matchElement.classList.remove('active');
        }
    }

    pdf.save('embu-calculator.pdf');
}

// Export Backup (JSON)
function exportBackup() {
    const dataStr = JSON.stringify({
        matches: matches,
        currentMatchId: currentMatchId,
        exportDate: new Date().toISOString()
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `embu-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    alert('Backup berhasil didownload!');
}

// Import Backup
function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.matches || !Array.isArray(data.matches)) {
                alert('Format file backup tidak valid!');
                return;
            }

            if (confirm('Import data akan menimpa semua data yang ada. Lanjutkan?')) {
                matches = data.matches;
                currentMatchId = data.currentMatchId || matches[0]?.id;
                saveData();
                renderTabs();
                renderMatches();
                alert('Data berhasil di-import!');
            }
        } catch (error) {
            alert('Gagal membaca file backup. Pastikan file adalah backup yang valid.');
            console.error(error);
        }
    };
    reader.readAsText(file);

    // Reset input file
    event.target.value = '';
}
