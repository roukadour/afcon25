document.addEventListener('DOMContentLoaded', () => {
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
    function init() {
        createGroups();
        setupSortable();
        setupEventListeners();
    }

    function createGroups() {
        const container = document.querySelector('.groups-container');
        container.innerHTML = Object.keys(groups).map(groupId => `
            <article class="group">
                <h3>Group ${groupId}</h3>
                <div class="teams">
                    ${groups[groupId].map(team => `
                        <div class="team">
                            <span class="fi fi-${countryCodes[team]}"></span>
                            ${team}
                        </div>
                    `).join('')}
                </div>
            </article>
        `).join('');
    }

    function setupSortable() {
        document.querySelectorAll('.teams').forEach(teams => {
            new Sortable(teams, {
                animation: 150,
                ghostClass: 'dragging',
                onEnd: (evt) => {
                    const groupId = evt.to.closest('.group').querySelector('h3').textContent.split(' ')[1];
                    groups[groupId] = Array.from(evt.to.children).map(team => 
                        team.textContent.trim().replace(/\n/g, '')
                    );
                }
            });
        });
    }

    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.active-section').classList.remove('active-section');
                document.querySelector('button.active').classList.remove('active');
                document.getElementById(btn.dataset.section).classList.add('active-section');
                btn.classList.add('active');
            });
        });

        // Lock Groups
        document.getElementById('lockGroups').addEventListener('click', () => {
            if (validateGroups()) {
                groupsLocked = true;
                document.querySelectorAll('.teams').forEach(teams => 
                    Sortable.get(teams).option('disabled', true)
                );
                document.getElementById('proceedMessage').style.display = 'none';
                initKnockoutStage();
                document.querySelector('[data-section="knockout"]').click();
            } else {
                document.getElementById('proceedMessage').style.display = 'block';
            }
        });

        // Reset
        document.getElementById('reset').addEventListener('click', () => {
            groupsLocked = false;
            currentSelections.clear();
            init();
            document.querySelector('[data-section="groups"]').click();
        });

        // Share
        document.getElementById('share').addEventListener('click', shareBracket);
    }

    function validateGroups() {
        return Object.values(groups).every(group => 
            new Set(group).size === 4 && group.length === 4
        );
    }

    function initKnockoutStage() {
        determineThirdPlace();
        createBracket();
        setupKnockoutListeners();
    }

    function determineThirdPlace() {
        thirdPlaceQualifiers = Object.entries(groups)
            .map(([group, teams]) => ({
                group,
                team: teams[2],
                points: Math.random() // Simulate ranking
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 4)
            .map(t => t.group);
    }

    function createBracket() {
        const bracket = document.querySelector('.bracket');
        bracket.innerHTML = `
            <div class="round">
                <h3>Round of 16</h3>
                <div class="matches">
                    ${createRound16Matches()}
                </div>
            </div>
            <div class="round">
                <h3>Quarter-finals</h3>
                <div class="matches">
                    ${Array(4).fill().map(() => `
                        <div class="match">
                            <div class="team"></div>
                            <div class="vs">vs</div>
                            <div class="team"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="round">
                <h3>Semi-finals</h3>
                <div class="matches">
                    ${Array(2).fill().map(() => `
                        <div class="match">
                            <div class="team"></div>
                            <div class="vs">vs</div>
                            <div class="team"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="round">
                <h3>Final</h3>
                <div class="matches">
                    <div class="match final">
                        <div class="team"></div>
                        <div class="vs">vs</div>
                        <div class="team"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function createRound16Matches() {
        const matches = [
            ['A', 1, 'C', 3], ['B', 1, 'F', 3],
            ['C', 1, 'A', 3], ['D', 1, 'E', 3],
            ['E', 1, 'D', 3], ['F', 1, 'B', 3],
            ['A', 2, 'B', 2], ['C', 2, 'D', 2]
        ];
        
        return matches.map(match => `
            <div class="match">
                <div class="team" data-group="${match[0]}" data-pos="${match[1]}">
                    ${getTeam(match[0], match[1])}
                </div>
                <div class="vs">vs</div>
                <div class="team" data-group="${match[2]}" data-pos="${match[3]}">
                    ${getTeam(match[2], match[3])}
                </div>
            </div>
        `).join('');
    }

    function getTeam(group, pos) {
        if (pos === 3 && !thirdPlaceQualifiers.includes(group)) return 'N/A';
        const team = groups[group][pos - 1];
        return `<span class="fi fi-${countryCodes[team]}"></span>${team}`;
    }

    function setupKnockoutListeners() {
        document.querySelectorAll('.match .team').forEach(team => {
            team.addEventListener('click', () => selectWinner(team));
        });
    }

    function selectWinner(selected) {
        const match = selected.closest('.match');
        const round = match.closest('.round');
        
        match.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
        selected.classList.add('selected');
        
        const winner = selected.textContent.trim();
        currentSelections.set(match, winner);
        
        if (round.nextElementSibling) {
            propagateWinner(round, match, winner);
        } else {
            showChampion(winner);
        }
    }

    function propagateWinner(round, match, winner) {
        const nextRound = round.nextElementSibling;
        const matchIndex = Array.from(round.querySelectorAll('.match')).indexOf(match);
        const nextMatch = nextRound.querySelectorAll('.match')[Math.floor(matchIndex / 2)];
        const slot = matchIndex % 2 === 0 ? 0 : 1;
        
        const teamSlot = nextMatch.querySelectorAll('.team')[slot];
        teamSlot.innerHTML = `
            <span class="fi fi-${countryCodes[winner]}"></span>
            ${winner}
        `;
    }

    function showChampion(winner) {
        const final = document.querySelector('.match.final');
        final.innerHTML = `
            <div class="
