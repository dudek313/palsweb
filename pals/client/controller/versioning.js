updateVersion = function(type, oldRecord, newRecord) {
    if(type == 'dataSet') {
        newRecord.version = oldRecord.version + 1;
        newRecord.latest = true;
        var newRecordId = '';
        Meteor.call('dataSets.insert', newRecord, function(error, newRecordId) {
            if( error ) {
                console.log(error);
            }
            else {
                console.log('update dataSet version record: ' + newRecordId);
//                I need to add the following once I get the callback working. At the moment, newRecordId is undefined
//                Session.set('currentDataSet', doc);
            }
        });

	Meteor.call('dataSets.update', {_id : oldRecord._id}, {$set:{latest:false}});
        // update latest version in parent dataSet and other versions
//        Meteor.call('dataSets.update', {_id: oldRecord.source_id}, {$set:{latestVersion:newRecord.version}});
//        var oldversions = DataSets.find({source_id : oldRecord.source_id},{_id:1});
//        Meteor.call('dataSets.update', {source_id : oldRecord.source_id}, {$set:{latestVersion:newRecord.version}});

//        callback(newRecordId);
    }
}
