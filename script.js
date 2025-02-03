document.addEventListener('DOMContentLoaded', () => {
    // Tournament data
    const groups = {
        'A': ['Morocco', 'Mali', 'Zambia', 'Comoros'],
        'B': ['Egypt', 'South Africa', 'Angola', 'Zimbabwe'],
        'C': ['Nigeria', 'Tunisia', 'Uganda', 'Tanzania'],
        'D': ['Senegal', 'DR Congo', 'Benin', 'Botswana'],
        'E': ['Algeria', 'Burkina Faso', 'Equatorial Guinea', 'Sudan'],
        'F': ['Cote d’Ivoire', 'Cameroon', 'Gabon', 'Mozambique']
    };

    const countryCodes = {
        'Morocco': 'ma', 'Mali': 'ml', 'Zambia': 'zm', 'Comoros': 'km',
        'Egypt': 'eg', 'South Africa': 'za', 'Angola': 'ao', 'Zimbabwe': 'zw',
        'Nigeria': 'ng', 'Tunisia': 'tn', 'Uganda': 'ug', 'Tanzania': 'tz',
        'Senegal': 'sn', 'DR Congo': 'cd', 'Benin': 'bj', 'Botswana': 'bw',
        'Algeria': 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq', 'Sudan': 'sd',
        'Cote d’Ivoire': 'ci', 'Cameroon': 'cm', 'Gabon': 'ga', 'Mozambique': 'mz'
    };

    let currentSelections = new Map();

    // Initialize tournament
    function initializeTournament() {
        // Set up group stage teams
        document.querySelectorAll('.group').forEach(groupEl => {
            const groupId = groupEl.querySelector('h3').textContent.split(' ')[1];
            const teams = groupEl.querySelectorAll('.team');
            
            teams.forEach((teamEl, index) => {
                const teamName = groups[groupId][index];
                teamEl.querySelector('.fi').className = `fi fi-${countryCodes[teamName]}`;
                teamEl.childNodes[2].textContent = teamName;
            });
        });

        // Initialize knockout stage
        initializeKnockoutStage();
        setupEventListeners();
    }

    function initializeKnockoutStage() {
        // Set up Round of 16 matches
        const round16Matches = [
            { group: 'A', pos: 1 }, { group: 'C', pos: 3 },
            { group: 'B', pos: 1 }, { group: 'F', pos: 3 },
            { group: 'C', pos: 1 }, { group: 'A', pos: 3 },
            { group: 'D', pos: 1 }, { group: 'E', pos: 3 },
            { group: 'E', pos: 1 }, { group: 'D', pos: 3 },
            { group: 'F', pos: 1 }, { group: 'B', pos: 3 },
            { group: 'A', pos: 2 }, { group: 'B', pos: 2 },
            { group: 'C', pos: 2 }, { group: 'D', pos: 2 }
        ];

        document.querySelectorAll('#knockout .match .team').forEach((teamEl, index) => {
            const { group, pos } = round16Matches[index];
            const teamName = groups[group][pos - 1];
            teamEl.querySelector('.fi').className = `fi fi-${countryCodes[teamName]}`;
            teamEl.childNodes[2].textContent = teamName;
            teamEl.dataset.original = teamName;
        });
    }

    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.active-section').classList.remove('active-section');
                document.getElementById(button.dataset.section).classList.add('active-section');
                document.querySelector('nav button.active').classList.remove('active');
                button.classList.add('active');
            });
        });

        // Team selection
        document.querySelectorAll('.match .team').forEach(teamEl => {
            teamEl.addEventListener('click', () => handleTeamSelection(teamEl));
        });

        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            currentSelections.clear();
            initializeTournament();
        });

        // Share button
        document.getElementById('share').addEventListener('click', shareResults);
    }

    function handleTeamSelection(selectedTeam) {
        const match = selectedTeam.closest('.match');
        const round = match.closest('.round');
        
        // Clear previous selection in this match
        match.querySelectorAll('.team').forEach(team => {
            team.classList.remove('selected');
        });
        
        selectedTeam.classList.add('selected');
        const winner = selectedTeam.dataset.original || selectedTeam.textContent.trim();
        
        // Store selection
        currentSelections.set(match, winner);
        
        // Propagate winner to next round
        propagateWinner(round, match, winner);
    }

    function propagateWinner(round, match, winner) {
        const nextRound = round.nextElementSibling;
        if (!nextRound) return;

        const matchIndex = Array.from(round.querySelectorAll('.match')).indexOf(match);
        const nextMatches = nextRound.querySelectorAll('.match');
        const targetMatch = nextMatches[Math.floor(matchIndex / 2)];
        
        const slot = matchIndex % 2 === 0 ? 0 : 1;
        const teamSlots = targetMatch.querySelectorAll('.team');
        
        if (teamSlots[slot]) {
            teamSlots[slot].querySelector('.fi').className = `fi fi-${countryCodes[winner]}`;
            teamSlots[slot].childNodes[2].textContent = winner;
            teamSlots[slot].dataset.original = winner;
        }
    }

    async function shareResults() {
        try {
            const bracket = document.querySelector('.bracket');
            const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
            
            html2canvas.default(bracket).then(canvas => {
                const link = document.createElement('a');
                link.download = 'afcon-bracket.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        } catch (error) {
            alert('Error generating share image');
        }
    }

    // Start the tournament
    initializeTournament();
});
