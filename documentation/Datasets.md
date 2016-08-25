# Datasets
* At this stage, there are 2 kinds of Datasets being used by the system:
1. Driving Dataset - which provides input to a user's model
2. Evaluation Dataset - observational data that can be compared with the Model Output in order to evaluate the user's model

* The system should allow for multiple versions of a Dataset, each with a unique ID, with the system managing version control.
* Since we only want to give users access to the Driving Datasets, and not the Evaluation Datasets, the system should have a checkbox to determine whether a given Dataset should be downloadable or not.
* Datasets should be accessible regardless of whether one is in a Workspace or not.
  * This will also inform the R-script as to what kind of Dataset we are talking about (Driving or Evaluation).
  * At a later time, we may wish to put in checkboxes to detemine whether a Dataset is Driving/Evaluation/Other.

## Migration
* For the purposes of migration from the old system, we will be migrating the latest version (v. 1.4) of the 42 Datasets in the Public Workspace.
* Additionally we will migrate the latest version of the Datasets in the Australian Savannas Workspace.
