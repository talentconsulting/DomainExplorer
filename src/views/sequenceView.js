class SquenceView{

    route(routeParts){
        switch (routeParts[1]) {
            case "all"://sequences/all
                this.renderSequenceList(getAllSequences(), "All Sequences", "");
                break;

            case "sequence"://sequences/sequence/{sequenceId}
                var sequenceId = routeParts[2];
                this.renderSequence(sequenceId);
                break;

        }
    }

    renderSequenceList(sequences, navHeading, navDescription) {

        var sequencesHtml = '';
        sequences.forEach(s=>{

            sequencesHtml += `
                <article class="card" onclick="navigate('/sequences/sequence/${s.id}')">
                    <h3>${s.name}</h3>
                </article>`;
        })

        var html = `
            <div class="card-grid">
                ${sequencesHtml}
            </div>
        `;

        updatePage({
            selectedNav:'sequencesNavigation',  
            navHeading:navHeading,
            navDescription:navDescription,
            content:html
        });

    }

    async renderSequence(sequenceId) {

        var sequence = getSequenceById(sequenceId);
        var services = servicesRepository.getAllServices();

        var html = `
            <div class="mermaid">
                ${sequence.diagram}
            </div>
        `;

        updatePage({
            selectedNav:'sequencesNavigation',  
            navHeading: sequence.name,
            navDescription:'',
            content:html
        });

        await mermaidGlobal.run();


        const svg =
            document.querySelector(
                '#pageContent svg'
            );

        svg.querySelectorAll('.actor').forEach(actor => {
            const name =
                actor.textContent.trim();

            var matchingService = services.find(x=>x.name == name);

            if(matchingService != undefined){
                actor.style.cursor =
                    'pointer';

                actor.addEventListener(
                    'click',
                    () => {
                        navigate(`/services/service/${matchingService.id}`);
                        //renderApi(matchingService.id);
                    });
            }


        });

        svg.querySelectorAll('.messageText').forEach(messageText => {
            const name =
                messageText.textContent.trim();

            messageText.style.cursor =
                'pointer';

            messageText.addEventListener(
                'click',
                () => {
                    alert(name);
                    //renderService(name);
                });
        });
    }
}
const sequencesView = new SquenceView();