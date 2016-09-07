// Fields for different list tables

NAME_FIELD = { fieldId: "1", key: 'name', label: 'Name' };
SP_LEVEL_FIELD = { fieldId: "2", key: 'spatialLevel', label: 'Spatial Level' };
RESOLUTION_FIELD = { fieldId: "3", key: 'resolution', label: 'Resolution' };
TIME_STEP_FIELD = { fieldId: "4", key: 'timeStepSize', label: 'Time Step Size' };
VEG_TYPE_FIELD = { fieldId: "5", key: 'vegType', label: 'Vegetation Type' };
REGION_FIELD = { fieldId: "6", key: 'region', label: 'Region' };
COUNTRY_FIELD = { fieldId: "7", key: 'country', label: 'Country' };
YEARS_FIELD = { fieldId: "8", key: 'years', label: 'Years' };

VARIABLES_FIELD = {
    fieldId: "9",
    key: 'variables',
    label: 'Variables',
    fn: function (value, object, key) {
      return variableList(object);
    }
};

// Fullname has been deprecated from the system. Will need to be updated.
OWNER_FIELD = {
    fieldId: "10",
    key: 'ownerName',
    label: "Owner",
    fn: function (value, object, key) {
      var selector = {_id: object.owner};
      var owner = Meteor.users.findOne(selector);
      if (owner && owner.profile) {
        if (owner.profile.fullname)
          var fullname = owner.profile.fullname;
        else if (owner.profile.firstName && owner.profile.lastName)
          var fullname = owner.profile.firstName + " " + owner.profile.lastName;
      }

      return fullname;
    }
};

VIEW_ANALYSES_FIELD = {
    fieldId: "11",
    key: 'viewAnalyses',
    label: "View Analyses",
    fn: function (value, object, key) { return "None Available" }
};

DELETE_FIELD = {
  fieldId: "12",
  key: 'delete',
  label: "Delete",
  headerClass: 'button-col',
  cellClass: 'button-col',
  fn: function (value, object, key) {
    return new Spacebars.SafeString(
      "<button class='btn delete-btn btn-danger btn-xs' id="+ object._id +">Delete</button>");
  }
}

CLONE_FIELD = {
  fieldId: "13",
  key: 'clone',
  label: "Clone",
  headerClass: 'button-col',
  cellClass: 'button-col',
  fn: function (value, object, key) {
    if (notCloned(object._id)) {
      return new Spacebars.SafeString(
        "<button class='btn btn-primary btn-xs clone-exp' id="+ object._id + ">Clone</button>");
    } else {
      return new Spacebars.SafeString(
        "<button class='btn btn-xs' disabled=true>Cloned</button>");
    }
  }
}

EXPERIMENT_NAME_FIELD = {
  fieldId: "14",
  key: "experiment",
  label: "Experiment",
  fn: function (value, modelOutput, key) {
    var experiments = modelOutput.experiments;
    if (experiments && experiments[0]) {
      var expId = experiments[0];
      if (expId) {
        var exp = Experiments.findOne(expId);
        if (exp)
          return new Spacebars.SafeString(
            "<a class='exp-link' id=" + exp._id + ">" + exp.name + "</a>");
      }
    }
  }
};

COMMENTS_FIELD = {
  fieldId: "15",
  key: "comments",
  label: "Comments",
  fn: function (value, model, key) {
    var comments = model.comments;
    if (comments) {
      comments = comments.substr(0,50);
      if (comments.length > 48) {
        comments = comments + "...";
      }
      return comments;
    }
  }
}

URL_FIELD = { fieldId: "16", key: "url", label: "Web Page URL" };

DATE_FIELD = {
  fieldId: "17",
  key: "created",
  label: "Created",
  fn: function (value, model, key) {
    var theDate = new Date(model.created);
    return theDate.toLocaleDateString();
  }
}
