const allTeams = [
  {
    "id": "EarnAndPay",
    "name": "Earn and Pay",
    "description": "Calculates earnings",
    "services":[
      "apim.sfa.das.learnerData", 
      "sfa.das.learning.innerapi",
      "sfa.das.learning.azureFunction",
      "sfa.das.funding.apprenticeshipearnings",
      "sfa.das.funding.apprenticeshipearnings.azureFunction",
      "das.collection.calendar"]
  },
  {
    "id": "sld",
    "name": "Data Collections",
    "description": "Data Collections team owns SLD, validation of funding rules. They determin add update or delete",
    "services":["submit.learner.data"]
  },
  {
    "id": "approvals",
    "name": "Approvals",
    "description": "Also known as commitments, handle employer approvals of provider courses",
    "services":[
      "SFA.DAS.CommitmentsV2",
      "sfa.das.learnerdata.api",
      "sfa.das.learnerdata.jobs"]
  },
  {
    "id": "payments",
    "name": "Payments",
    "description": "Owns PV2 product, action the payments",
    "services":["pv2"]
  },
  {
    "id": "misc",
    "name": "Misc",
    "description": "Other teams",
    "services":["coursesApi"]
  }
];