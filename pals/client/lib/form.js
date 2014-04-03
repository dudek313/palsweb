if( typeof templateSharedObjects === 'undefined' ) templateSharedObjects = {};

templateSharedObjects.form = function(spec) {
    var that = {};
    
    var meteorSessionId = spec.meteorSessionId;
    var collectionName = spec.collectionName;
    
    function eventArray() {
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
            'extend':function(other) {
                console.log(other);
                for( var i in other ) {
                    if( other.hasOwnProperty(i) ) {
                        this[i] = other[i];
                    }
                }
                console.log(this);
                return this;
            }
        }
    };
    that.eventArray = eventArray;
    
    function update(event) {
        var fieldName = $(event.target).attr('name');
        var value = $(event.target).val();
        performUpdate(fieldName,value);
    };
    
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
                        $('.error').html('There was an error saving the field, please try again');
                        $('.error').show();
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
                        if( error.error == 409 ) $('.error').html('A document with that name already exists');
                        else $('.error').html('There was an error saving your value, please try again');
                        $('.error').show();
                    }
                    else {
                        currentDocument._id = id;
                        Session.set(meteorSessionId,id);
                    }
                });
            }
        }
    };
    
    return that;
}