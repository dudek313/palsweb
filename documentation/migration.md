# Standards for Migration from PostgreSQL
* In Postgres, duplicate User records exist where the user has 2 different Usernames, but only a single email. We will determine which of those User records has the more significant data associated with it (i.e. Model Outputs) and only migrate that one.
* The Public Workspace concept will not be used in the new system, so all the data within that Workspace will not be migrated.
* Model profiles which have no associated Model Outputs will not be migrated.
