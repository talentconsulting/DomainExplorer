const sequenceDiagrams=[
    {
        "id":"withdrawalReasonOnProgramme",
        "name":"Withdrawal Reason for OnProgramme Apprenticeship update",
        "diagram":`
            sequenceDiagram
    participant Submit Learner Data
    participant Learner Data Outer
    participant Learning Inner Api
    participant Approvals Handlers
    participant Earnings Inner Api

    Submit Learner Data ->> Learner Data Outer: Get Learners
    Learner Data Outer ->> Submit Learner Data: Learners
    Submit Learner Data ->> Learner Data Outer: Update Learner
    
    Learner Data Outer ->> Learning Inner Api: Update Learner

    Learning Inner Api ->> Approvals Handlers: ApprenticeshipWithdrawn (event)

    Learning Inner Api ->> Learner Data Outer: Learner Updated (Withdrawal)

    Learner Data Outer ->> Earnings Inner Api: Withdraw Learner

    Learner Data Outer ->> Submit Learner Data: Learner Deleted
        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "ApprenticeshipWithdrawn (event)"
            }
        ]
    },
    {
        "id":"withdrawalReasonShortCourse",
        "name":"Withdrawal Reason for Apprenticeship units update",
        "diagram":`
sequenceDiagram
    participant Submit Learner Data
    participant Learner Data Outer
    participant Learning Inner Api
    participant Approvals Handlers
    participant Earnings Inner Api

    Submit Learner Data ->> Learner Data Outer: GetShortCourseLearners
    Learner Data Outer ->> Submit Learner Data: Learners
    Submit Learner Data ->> Learner Data Outer: UpdateShortCourseLearning
    
    Learner Data Outer ->> Learning Inner Api: UpdateShortCourse

    Learning Inner Api ->> Approvals Handlers: LearningWithdrawnEvent (event)

    Learning Inner Api ->> Learner Data Outer: UpdateShortCourseResult (Withdrawal)

    Learner Data Outer ->> Earnings Inner Api: UpdateOnProgramme

    Learner Data Outer ->> Submit Learner Data: Returns Accepted Response
        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "LearningWithdrawnEvent (event)"
            }
        ]
    },
    {
        "id":"updateShortCourse",
        "name":"Basic flow for updating short course learning",
        "diagram":`
sequenceDiagram
    participant Submit Learner Data
    participant Learner Data Outer
    participant Learning Inner Api
    participant Earnings Inner Api
    participant Payments V2

    Submit Learner Data ->> Learner Data Outer: GetShortCourseLearners
    Learner Data Outer ->> Submit Learner Data: Learners
    Submit Learner Data ->> Learner Data Outer: UpdateShortCourseLearning
    
    Learner Data Outer ->> Learning Inner Api: UpdateShortCourse

    Learner Data Outer ->> Earnings Inner Api: UpdateShortCourseLearning

    Earnings Inner Api ->> Payments V2: CalculateGrowthAndSkillsPayments (event)

    Learner Data Outer ->> Submit Learner Data: Returns Accepted Response
        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "LearningWithdrawnEvent (event)"
            }
        ]
    },
    {
        "id":"earningsInnerApiShortCourseUpdate",
        "name":"Earnings Inner API flow for updating short course learning",
        "diagram":`
sequenceDiagram
autonumber
actor Client
participant SC as ShortCoursesController
participant CCmd as CreateUnapprovedShortCourseLearningCommandHandler
participant Fac as LearningFactory
participant Repo as LearningRepository
participant SCModel as ShortCourseLearning Domain Model
participant DB as Database

rect rgb(245, 250, 255)
Note over Client,DB: Short course create flow
Client->>SC: POST /shortCourses <br/>(includes LearningSupport + OnProgramme + Learner)
SC->>CCmd: Dispatch <br/> CreateUnapprovedShortCourseLearningCommand
CCmd->>Repo: GetShortCourseLearning(learningKey)
alt Learning does not exist
    CCmd->>Fac: CreateNewShortCourse(request)
    Fac-->>CCmd: ShortCourseLearning (from Learner + OnProgramme)
else Learning exists
    CCmd->>SCModel: Update/Add episode using OnProgramme fields
end

Note right of CCmd: LearningSupport reaches handler in request<br/>but is not mapped to model/payments
CCmd->>CCmd: Ignore request.LearningSupport (discard point)

CCmd->>SCModel: CalculateOnProgram(...)
CCmd->>Repo: Add/Update ShortCourseLearning
Repo->>DB: Persist short-course episode + earnings profile instalments
Repo-->>SC: Done
SC-->>Client: 200 OK
end

        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "LearningWithdrawnEvent (event)"
            }
        ]
    },
    {
        "id":"learningInnerApiShortCourseUpdate",
        "name":"Learning Inner API flow for updating short course learning",
        "diagram":`
sequenceDiagram
    autonumber
    actor Client
    participant Handler as Short Course Command Handler
    participant Learning as ShortCourseLearningDomainModel
    participant Episode as ShortCourseEpisodeDomainModel
    participant Repo as IShortCourseLearningRepository
    participant DB as ShortCourseLearningSupport table

    rect rgb(240,248,255)
    note over Client,DB: Create draft short course
    Client->>Handler: CreateDraftShortCourse(command with LearningSupport[])
    Handler->>Repo: GetByLearnerKey(learnerKey)
    alt No existing short course learning
        Handler->>Learning: CreateNew + AddEpisode(...)
        loop each LearningSupport item
            Learning->>Episode: AddLearningSupport(startDate, endDate)
        end
        Handler->>Repo: Add(learning)
        Repo->>DB: INSERT learning support rows
    else Existing learning and allowed to update same provider
        Handler->>Learning: Update(command.Model)
        Learning->>Episode: UpdateLearningSupport(updated list)
        Episode->>Episode: Remove rows not in request (by StartDate+EndDate)
        Episode->>Episode: Add missing rows from request
        Handler->>Repo: Update(learning)
        Repo->>DB: Persist add/remove changes
    else Existing learning but blocked/ignored case
        Handler-->>Client: null (ignored)
        note over DB: No LearningSupport change
    end
    end

    rect rgb(245,255,245)
    note over Client,DB: Update short course
    Client->>Handler: UpdateShortCourse(command with LearningSupport[])
    Handler->>Repo: Get(learningKey)
    Handler->>Learning: Update(command.Model)
    Learning->>Episode: UpdateLearningSupport(updated list)
    Episode->>Episode: Remove rows not in request (StartDate+EndDate)
    Episode->>Episode: Add missing rows
    Handler->>Repo: Update(learning)
    Repo->>DB: Persist add/remove changes
    end

    rect rgb(255,248,240)
    note over Client,DB: Remove short course
    Client->>Handler: RemoveShortCourse(learningKey, ukprn)
    Handler->>Repo: Get(learningKey)
    Handler->>Learning: Remove(ukprn)
    alt Episode is approved
        Learning->>Episode: IsRemoved = true
        Handler->>Repo: Update(learning)
        note over DB: LearningSupport rows are not explicitly deleted
    else Not approved / not found
        Handler-->>Client: null (ignored)
        note over DB: No LearningSupport change
    end
    end

        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "LearningWithdrawnEvent (event)"
            }
        ]
    },
    {
        "id":"learnerDataOuterApiShortCourseUpdate",
        "name":"Learner Data Outer API flow for updating short course learning",
        "diagram":`

        sequenceDiagram
    autonumber
    actor Client as Provider Client
    participant API as LearnerData API
    participant Ctrl as ShortCoursesController
    participant Med as MediatR
    participant CreateH as CreateDraftShortCourseCommandHandler
    participant UpdateH as UpdateShortCourseLearningCommandHandler
    participant CourseSvc as Course Lookup Service
    participant LearnAPI as Learning Inner API
    participant EarnAPI as Earnings Inner API
    participant Bus as NServiceBus/Payments

    rect rgb(235, 248, 255)
    Note over Client,Bus: CREATE SHORT COURSE (learning support is propagated)
    Client->>API: POST /providers/{ukprn}/shortCourses\n(with OnProgramme[].LearningSupport)
    API->>Ctrl: Route request
    Ctrl->>Med: Send CreateDraftShortCourseCommand
    Med->>CreateH: Handle

    CreateH->>CourseSvc: Get course details (price/type)
    CourseSvc-->>CreateH: price + learningType

    CreateH->>LearnAPI: POST shortCourses\nCreateDraftShortCourseRequest\n(includes LearningSupport)
    LearnAPI-->>CreateH: learningKey + episodeKey (+ status)

    alt Learning returns 204 NoContent
        CreateH-->>Ctrl: short-circuit (no earnings call)
        Ctrl-->>Client: 202 Accepted
    else Learning returns created/reinstated
        alt Reinstated
            CreateH->>EarnAPI: PUT on-programme earnings update
            EarnAPI-->>CreateH: updated earnings
            CreateH->>Bus: Send CalculateGrowthAndSkillsPayments
            CreateH->>Bus: Publish recalculated event
            CreateH-->>Ctrl: success
            Ctrl-->>Client: 202 Accepted
        else New draft short course
            CreateH->>EarnAPI: POST unapproved short course\n(includes LearningSupport)
            EarnAPI-->>CreateH: accepted
            CreateH->>Bus: Publish LearnerDataEvent
            CreateH-->>Ctrl: correlationId
            Ctrl-->>Client: 202 Accepted
        end
    end
    end

    rect rgb(255, 248, 235)
    Note over Client,Bus: UPDATE SHORT COURSE (learning support not mapped)
    Client->>API: PUT /providers/{ukprn}/shortCourses/{learningKey}\n(request still contains OnProgramme[].LearningSupport)
    API->>Ctrl: Route request
    Ctrl->>Med: Send UpdateShortCourseLearningCommand
    Med->>UpdateH: Handle

    Note over UpdateH: Maps request to UpdateShortCourseLearningRequestBody:\nLearnerRef + OnProgramme dates/milestones only\n(no LearningSupport field)
    UpdateH->>LearnAPI: PUT shortCourses/{learningKey}\n(no learning support payload)
    LearnAPI-->>UpdateH: response with Changes[]

    alt Changes include WithdrawalDate/Milestone/CompletionDate
        UpdateH->>EarnAPI: PUT on-programme earnings update
        EarnAPI-->>UpdateH: updated earnings
    else Other changes (e.g., LearnerRef/Reinstated)
        UpdateH->>EarnAPI: GET existing short course earnings
        EarnAPI-->>UpdateH: earnings snapshot
    end

    UpdateH->>Bus: Send CalculateGrowthAndSkillsPayments
    UpdateH->>Bus: Publish recalculated event
    UpdateH-->>Ctrl: done
    Ctrl-->>Client: 202 Accepted
    end

        `,
        "aliases": [
            {
                "id": "LearningWithdrawnEvent",
                "displayName": "LearningWithdrawnEvent (event)"
            }
        ]
    }
];

function getAllSequences(){
    return sequenceDiagrams;
}

function getSequenceById(id){ 
    return sequenceDiagrams.find(x=> x.id === id);
}