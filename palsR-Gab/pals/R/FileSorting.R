# Functions for sorting files sent to Master Analysis Script
#
# Gab Abramowitz, UNSW, 2016 (palshelp at gmail dot com)

FindFileTypes = function(files,requestedtype){
	# Find out which files are ModelOutputs, DataSets or Benchmarks
	fileinfo = list()
	unitinfo = list()
	fileunitnumbers = c()
	names = c()
	ctr = 0
	unitctr = 0
	for (i in 1:(length(files)) ){ # loop over all files sent to Master Analysis Script
   		if( files[[i]][['type']] == requestedtype ) {
   			file <- files[[i]]
    		ctr = ctr + 1
    		# Record info about this file:
        	fileinfo[[ctr]] = list(path=file[['path']],mimetype=file[['mimetype']],
        		name=file[['name']],number=file[['number']])
        	# Add unit number to vector of unit numbers for appropriate files:
        	fileunitnumbers[ctr] = as.integer(file[['number']])
        	# Check if current file is first in a new unit (e.g. new MO)
        	if(unitctr != length(unique(fileunitnumbers))){
        		unitctr = unitctr + 1
        		unitinfo[[unitctr]] = list(filepaths=c(file[['path']]), name=file[['name']], 
        			number=file[['number']])
        		names[unitctr] = name=file[['name']]
        	}else{
        		# Just in case, e.g., MO numbers aren't 1,2,3, etc
        		unitindcies = c(1:length(unique(fileunitnumbers)))
        		unitindex = unitindcies[ unique(fileunitnumbers)==fileunitnumbers[ctr] ]
        		# Add this file to the list of files asscoiated with this unit (e.g. MO)
        		unitinfo[[unitindex]]$filepaths = c(unitinfo[[unitindex]]$filepaths,file[['path']])
        	}
    	}
	}
	return(list(files = fileinfo, unit = unitinfo, number = unitctr, nfiles = ctr, names = names))
}