var reference = Reference.findOne();
if( !reference ) {
    Reference.insert({
        'dataSetType' : ['flux tower','other'],
        'country' : ['Australia','World'],
        'vegType' : ['Evergreen broadleaf','urban']
    });
}