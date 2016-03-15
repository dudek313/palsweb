# How Models Should Work in Palsweb
* Models are a documentation tool designed to aid reporducibility, but lack a well-defined functional role within the system (i.e. they don't impact code functionality).
* The Model profile should be owned by the User who creates it, and should usable __only__ by that User. It should be visible to other Users in a Workspace only if Model Outputs associated with it have been submitted to Experiments within that Workspace.
* Model profiles are only unique within a User's collection of Model profiles. (i.e. identical profiles can be owned by different Users.)
* The "ALL MODELS" menu-item should display all Models associated with Model Outputs in Experiments in *this* Workspace.
* The "MY MODELS" menu-item should display **all** of a User's Models in *all* Workspaces, with an indicator identifying Models used within the current active Workspace.
* While we want Users to be able to edit a Model profile, this carries with it a risk of creating confusion by allowing the User to modify the Model mid-stream while generating different Model Outputs, thereby threatening reproducibility within the system. To try and avoid this problem:
  * Preferably, a version history of edits to the Model profile should be kept. (Each of these versions should be immutable.)
  * Warning messages should be implemented to display when a User tries to edit a Model profile **if** a Model Output has already been associated with it.
