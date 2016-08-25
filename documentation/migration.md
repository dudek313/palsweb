# Standards for Migration from PostgreSQL
* In Postgres, duplicate User records exist where the user has 2 different Usernames, but only a single email. We will determine which of those User records has the more significant data associated with it (i.e. Model Outputs) and only migrate that one.
* The Public Workspace concept will not be used in the new system, so all the data within that Workspace will not be migrated.
* Instead of having the Public Workspace, it was suggested that the user should start out in "Browse Mode" which will enable them to see listings of all Experiments, Datasets, Models and Model Outputs, while only being able to access them within the relevant Workspace. They should be given the message that:
  * "You are currently in Browse Mode. To contribute model outputs to experiments you must join an existing workspace or create a new one."
  * Have to discuss whether they should have full access to Datasets in Browse Mode.

* Model profiles which have no associated Model Outputs will not be migrated.
