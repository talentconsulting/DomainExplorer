class TeamsRepositorysitory {

    getAllTeams(){
        var teams = [];
        allTeams.forEach(t=> teams.push(this.getTeam(t)));
        return teams;
    }

    getTeamById(teamId){ 
        return this.getTeam(allTeams.find(t=>t.id===teamId));
    }

    getTeam(teamBasic) {

        const services = [];

        return {
            id: teamBasic.id,
            name: teamBasic.name,
            description: teamBasic.description,
            services: teamBasic.services
        };
    }
}

const TeamsRepository = new TeamsRepositorysitory();