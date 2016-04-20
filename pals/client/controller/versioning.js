updateVersion = function(type, oldRecord, newRecord) {
    if(type == 'dataSet') {
        newRecord.version = oldRecord.latestVersion + 1;
        Meteor.call('dataSets.insert', newRecord);
        // update latest version in parent dataSet and other versions
        Meteor.call('dataSets.update', {_id: oldRecord.source_id}, {$set:{latestVersion:newRecord.version}});
        var oldversions = DataSets.find({source_id : oldRecord.source_id},{_id:1});
        Meteor.call('dataSets.update', {source_id : oldRecord.source_id}, {$set:{latestVersion:newRecord.version}});
    }
}
