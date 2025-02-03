document.addEventListener('DOMContentLoaded', () => {
    // Tournament Configuration
    const groups = {
        'A': ['Morocco', 'Mali', 'Zambia', 'Comoros'],
        'B': ['Egypt', 'South Africa', 'Angola', 'Zimbabwe'],
        'C': ['Nigeria', 'Tunisia', 'Uganda', 'Tanzania'],
        'D': ['Senegal', 'DR Congo', 'Benin', 'Botswana'],
        'E': ['Algeria', 'Burkina Faso', 'Equatorial Guinea', 'Sudan'],
        'F': ['Côte d\'Ivoire', 'Cameroon', 'Gabon', 'Mozambique']
    };

    const countryCodes = {
        'Morocco': 'ma', 'Mali': 'ml', 'Zambia': 'zm', 'Comoros': 'km',
        'Egypt': 'eg', 'South Africa': 'za', 'Angola': 'ao', 'Zimbabwe': 'zw',
        'Nigeria': 'ng', 'Tunisia': 'tn', 'Uganda': 'ug', 'Tanzania': 'tz',
        'Senegal': 'sn', 'DR Congo': 'cd', 'Benin': 'bj', 'Botswana': 'bw',
        'Algeria': 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq', 'Sudan': 'sd',
        'Côte d\'Ivoire': 'ci', 'Cameroon': 'cm', 'Gabon': 'ga', 'Mozambique': 'mz'
    };

    let currentSelections = new Map();
    let groupsLocked = false;
    let thirdPlaceQualifiers = [];

    // Initialization
    function initializeTournament() {
        initializeGroups();
        setupEventListeners();
        setupGroupSorting();
        createLockButton();
    }

    function initializeGroups() {
        document.querySelectorAll('.group').forEach(groupEl => {
            const groupId = groupEl.querySelector('h3').textContent.split(' ')[1];
            const teams = groupEl.querySelectorAll('.team');
            
            teams.forEach((teamEl, index) => {
                const teamName = groups[groupId][index];
                teamEl.querySelector('.fi').className = `fi fi-${countryCodes[teamName]}`;
                teamEl.childNodes[2].textContent = teamName;
                teamEl.dataset.position = index + 1;
            });
        });
    }

    // Group Stage Functionality
    function setupGroupSorting() {
        document.querySelectorAll('.group .teams').forEach(teamsContainer => {
            new Sortable(teamsContainer, {
                animation: 150,
                disabled: groupsLocked,
                onChoose: (evt) => evt.item.classList.add('dragging'),
                onUnchoose: (evt) => evt.item.classList.remove('dragging'),
                onEnd: (evt) => {
                    const groupId = evt.to.closest('.group').querySelector('h3').textContent.split(' ')[1];
                    groups[groupId] = Array.from(evt.to.children).map(team => 
                        team.childNodes[2].textContent.trim()
                    );
                    updateGroupPositions();
                }
            });
        });
    }

    function updateGroupPositions() {
        document.querySelectorAll('.group').forEach(groupEl => {
            const groupId = groupEl.querySelector('h3').textContent.split(' ')[1];
            groupEl.querySelectorAll('.team').forEach((teamEl, index) => {
                teamEl.dataset.position = index + 1;
            });
        });
    }

    function createLockButton() {
        const lockButton = document.createElement('button');
        lockButton.id = 'lockGroups';
        lockButton.textContent = 'Lock Groups & Proceed to Knockout';
        
        lockButton.addEventListener('click', () => {
            if (validateGroups()) {
                groupsLocked = true;
                document.querySelectorAll('.teams').forEach(teams => 
                    Sortable.get(teams).option('disabled', true)
                );
                lockButton.remove();
                document.getElementById('proceedMessage').remove();
                prepareKnockoutStage();
                document.querySelector('[data-section="knockout"]').click();
            } else {
                document.getElementById('proceedMessage').style.display = 'block';
            }
        });

        const message = document.createElement('div');
        message.id = 'proceedMessage';
        message.textContent = 'Please rank all teams in every group before proceeding!';
        message.style.display = 'none';
        
        document.querySelector('#groups').append(lockButton, message);
    }

    function validateGroups() {
        return Object.values(groups).every(group => 
            new Set(group).size === 4 && group.length === 4
        );
    }

    // Knockout Stage Functionality
    function prepareKnockoutStage() {
        determineThirdPlaceQualifiers();
        initializeKnockoutMatches();
        setupKnockoutListeners();
    }

    function determineThirdPlaceQualifiers() {
        const allThirdPlaces = Object.keys(groups).map(groupId => ({
            group: groupId,
            team: groups[groupId][2],
            points: Math.floor(Math.random() * 7) // Simulate ranking points
        }));

        thirdPlaceQualifiers = allThirdPlaces
            .sort((a, b) => b.points - a.points)
            .slice(0, 4)
            .map(t => t.group);
    }

    function initializeKnockoutMatches() {
        const round16Matches = [
            { type: 'winner', group: 'A', pos: 1 }, 
            { type: 'third', group: 'C', pos: 3 },
            { type: 'winner', group: 'B', pos: 1 }, 
            { type: 'third', group: 'F', pos: 3 },
            { type: 'winner', group: 'C', pos: 1 }, 
            { type: 'third', group: 'A', pos: 3 },
            { type: 'winner', group: 'D', pos: 1 }, 
            { type: 'third', group: 'E', pos: 3 },
            { type: 'winner', group: 'E', pos: 1 }, 
            { type: 'third', group: 'D', pos: 3 },
            { type: 'winner', group: 'F', pos: 1 }, 
            { type: 'third', group: 'B', pos: 3 },
            { type: 'runner', group: 'A', pos: 2 }, 
            { type: 'runner', group: 'B', pos: 2 },
            { type: 'runner', group: 'C', pos: 2 }, 
            { type: 'runner', group: 'D', pos: 2 }
        ];

        document.querySelectorAll('#knockout .match .team').forEach((teamEl, index) => {
            const { type, group, pos } = round16Matches[index];
            let teamName = '';
            
            if (type === 'third' && !thirdPlaceQualifiers.includes(group)) {
                teamName = 'N/A';
            } else {
                teamName = groups[group][pos - 1];
            }

            teamEl.querySelector('.fi').className = `fi fi-${countryCodes[teamName] || 'xx'}`;
            teamEl.childNodes[2].textContent = teamName;
            teamEl.dataset.original = teamName;
        });
    }

    function setupKnockoutListeners() {
        document.querySelectorAll('.match .team').forEach(teamEl => {
            teamEl.addEventListener('click', () => handleKnockoutSelection(teamEl));
        });
    }

    function handleKnockoutSelection(selectedTeam) {
        const match = selectedTeam.closest('.match');
        const round = match.closest('.round');
        
        match.querySelectorAll('.team').forEach(team => 
            team.classList.remove('selected')
        );
        selectedTeam.classList.add('selected');
        
        const winner = selectedTeam.dataset.original;
        currentSelections.set(match, winner);
        
        if (!round.nextElementSibling) {
            declareChampion(winner);
        } else {
            propagateWinner(round, match, winner);
        }
    }

    function propagateWinner(round, match, winner) {
        const nextRound = round.nextElementSibling;
        const matchIndex = Array.from(round.querySelectorAll('.match')).indexOf(match);
        const targetMatch = nextRound.querySelectorAll('.match')[Math.floor(matchIndex / 2)];
        const slot = matchIndex % 2 === 0 ? 0 : 1;
        
        const teamSlot = targetMatch.querySelectorAll('.team')[slot];
        teamSlot.querySelector('.fi').className = `fi fi-${countryCodes[winner]}`;
        teamSlot.childNodes[2].textContent = winner;
        teamSlot.dataset.original = winner;
    }

    function declareChampion(winner) {
        const finalMatch = document.querySelector('.match.final');
        finalMatch.innerHTML = `
            <div class="team champion">
                <span class="fi fi-${countryCodes[winner]}"></span>
                ${winner}
            </div>
            <div class="trophy">🏆</div>
        `;
    }

    // General Event Listeners
    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.active-section').classList.remove('active-section');
                document.getElementById(button.dataset.section).classList.add('active-section');
                document.querySelector('.active').classList.remove('active');
                button.classList.add('active');
            });
        });

        // Reset Button
        document.getElementById('reset').addEventListener('click', () => {
            currentSelections.clear();
            groupsLocked = false;
            initializeTournament();
            document.querySelector('[data-section="groups"]').click();
        });

        // Share Button
        document.getElementById('share').addEventListener('click', async () => {
            try {
                const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
                html2canvas.default(document.querySelector('.bracket')).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'afcon-bracket.png';
                    link.href = canvas.toDataURL();
                    link.click();
                });
            } catch (error) {
                alert('Error generating share image');
            }
        });
    }

    // Start the tournament
    initializeTournament();
});
