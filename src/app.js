/** Sets the clicked navigation option as active and clears other options */
function setNavigation(elementId){
    const navItems =
        document.querySelectorAll("#navBar li");

    navItems.forEach(item => {
        item.classList.remove("active");
        item.classList.add("inactive");
    });

    var selectedNav = document.getElementById(elementId);
    selectedNav.classList.remove("inactive");
    selectedNav.classList.add("active");

}

function updatePage(pageData){
     renderPage(pageData);
}

function renderPage(pageData){
    setNavigation(pageData.selectedNav);
    document.getElementById("NavOption").innerHTML = pageData.navHeading;
    document.getElementById("NavDescription").innerHTML = pageData.navDescription;
    document.getElementById('pageContent').innerHTML = pageData.content;
}

function navigate(route) {
    location.hash = route;
}

async function handleRoute() {

    if(!repositoriesInitialised){
        await initialiseRepos();
    }

    const routeParts = location.hash.substring(2).split('/');

    switch (routeParts[0]) {
        case "services":
            servicesView.route(routeParts);
            break;

        case "api":
            apiView.route(routeParts);
            break;

        case "database":
            dbView.route(routeParts);
            break;
        
        case "events":
            eventsView.route(routeParts);
            break;
        
        case "sequences":
            sequencesView.route(routeParts);
            break;
        
        case "teams":
            teamsView.route(routeParts);
            break;
    }
}

let repositoriesInitialised = false;
let servicesRepository = undefined;
let eventsRepository = undefined;
let databaseRepository = undefined;

async function initialiseRepos(){
 
    var repositoryInitialiser = new RepositoryInitialiser();
    var repos = await repositoryInitialiser.initialise();

    servicesRepository = repos.servicesRepo;
    eventsRepository = repos.eventsRepo;
    databaseRepository = repos.databaseRepo;
    repositoriesInitialised = true;
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);




let cy = undefined;

let mermaidGlobal = undefined;
