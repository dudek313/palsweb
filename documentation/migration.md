# Standards for Migration from PostgreSQL
* In Postgres, duplicate User records exist where the user has 2 different Usernames, but only a single email. The duplicate User records will not be migrated, which will result in Models, Model Outputs, etc. associated with those duplicate Usernames, not being migrated.
* The Public Workspace concept will not be used in the new system, so all the data within that Workspace will not be migrated.
* Model profiles which have no associated Model Outputs will not be migrated.
