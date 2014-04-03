if( typeof templateSharedObjects === 'undefined' ) templateSharedObjects = {};

// The form class turns a form in a meteor template into a form which saves
// attributes to the database whenever the user shifts focus away from input elements. 
// The events() function returns an object of event handlers which should be
// passed to the Template.myTemplateName.events(events) function. This returned object has an
// extend(extraEvents) function which can be used to add extra event handlers.
//
// Example usage:
//
// var extraEvents = {
//     'click .example-event':function(event) {
//         console.log('example extra event fired');
//     }
// }
//
// Template.myTemplateName.events(templateSharedObjects.form({
//     meteorSessionId: 'currentDocumentId',
//     collectionName: 'CurrentCollectionName'
// }).events().extend(events));
//
// Parameters:
// meteorSessionId - An identifier of a global reactive meteor variable which indicates
//     the current document. This is used for initialising the form with an existing document.
// collectionName - The collection in which to save the document. The GetCollectionByName(name) 
//     function (see pals/both/collections.js) is used to retrieve the actual collection.
// errorClass - The class of the html element in which to display any error messages.
//     This is optional and defaults to '.error'.
//
templateSharedObjects.form = function(spec) {
    var that = {};
    
    var meteorSessionId = spec.meteorSessionId; // global session identifier for current document
    var collectionName = spec.collectionName; // name of the Collection to save the document in
    var errorClass = spec.errorClass || '.error';
    
    // events returns an object of event handler functions to be passed to Template.name.events().
    // The function extend(other) is provided to add additional functions to the returned object. 
    function events() {
        return {
            'blur input': function (event) {
                update(event);
            },
            'blur textarea': function (event) {
                update(event);
            },
            'change select.trigger':function(event) {
                update(event);
            },
            // add all the event handlers from the given object to this object
            // actually adds all attributes, but not those from the prototype chain
            'extend':function(other) { 
                for( var i in other ) {
                    if( other.hasOwnProperty(i) ) {
                        this[i] = other[i];
                    }
                }
                return this;
            }
        }
    };
    that.events = events;
    
    // update(event) triggers an update in the database based on an event.
    function update(event) {
        var fieldName = $(event.target).attr('name');
        var value = $(event.target).val();
        performUpdate(fieldName,value);
    };
    
    // performUpdate(fieldName,value) updates the given field of the document in the database.
    // First the current document is loaded based on the meteorSessionId. If it is found the
    // document is updated, setting the field with the given fieldName to the given value.
    // Otherwise if no current document is found it is created, initialising it with the one
    // given fieldName and value.
    // On any error the displayError(message) function is used to display an error to the user.
    function performUpdate(fieldName,value) {
        if( value ) {
            var user = Meteor.user();
            currentDocumentId = Session.get(meteorSessionId);
            var reference = Reference.findOne();
        
            if( currentDocumentId ) {
                if ( value == "n/a" ) value = null;
                var selector = {'_id':currentDocumentId};
                var fieldModifier = {};
                fieldModifier[fieldName] = value;
                var modifier = {'$set':fieldModifier};
                GetCollectionByName(collectionName).update(selector,modifier,function(error){
                    if( error ) {
                        displayError('There was an error saving the field, please try again');
                    }
                });
            }
            else {
                currentDocument = {
                    'owner' : user._id,
                    'created' : new Date(),
                    'workspaces' : [user.profile.currentWorkspace._id]
                };
                if( fieldName != 'spatialLevel' ) currentDocument.spatialLevel = reference.spatialLevel[0];
                currentDocument[fieldName] = value;
                GetCollectionByName(collectionName).insert(currentDocument,function(error,id) {
                    if( error ) {
                        if( error.error == 409 ) displayError('A document with that name already exists');
                        else displayError('There was an error saving your value, please try again');
                    }
                    else {
                        currentDocument._id = id;
                        Session.set(meteorSessionId,id);
                    }
                });
            }
        };
        
        // displayError displays the given error message on the console and in the given errorClass 
        // html element.
        function displayError(message) {
            console.log(message);
            $(errorClass).html(message);
            $(errorClass).show();
        };
    };
    
    return that;
}