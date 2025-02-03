document.getElementById("generateBracket").addEventListener("click", function() {
    let selectedTeams = document.querySelectorAll(".team:checked");
    if (selectedTeams.length !== 16) {
        alert("Please select exactly 16 teams to continue.");
        return;
    }

    let teams = [];
    selectedTeams.forEach(team => teams.push(team.getAttribute("data-team")));

    document.getElementById("knockout-stage").classList.remove("hidden");

    let rounds = ["round16", "quarterfinals", "semifinals", "final"];
    let teamsPerRound = teams.slice();

    rounds.for
::contentReference[oaicite:0]{index=0}
 
