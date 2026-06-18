class TeamsView{
    route(routeParts) {
        this.renderTeamsList(TeamsRepository.getAllTeams(), "All Teams", "");
    }

    renderTeamsList(teams, navHeading, navDescription) {

        var teamsHtml = '';
        teams.forEach(t=>{

            teamsHtml += `
                <article class="card">
                    <h3>${t.name}</h3>

                    <p>${t.description}</p>

                    <div class="tag-group">
                        <span class="tag clickable" onclick="navigate('/services/team/${t.id}')">Owns ${t.services.length} services</span>
                    </div>

                </article>`;
        })

        var html = `
            <div class="card-grid">
                ${teamsHtml}
            </div>
        `;

        updatePage({
            selectedNav:'teamsNavigation',  
            navHeading:navHeading,
            navDescription:navDescription,
            content:html
        });

    }
}
const teamsView = new TeamsView();