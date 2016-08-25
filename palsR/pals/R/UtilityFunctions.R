# UtilityFuntions.R
#
# Utility functions for PALS R package
#
# Gab Abramowitz UNSW 2014 (palshelp at gmail dot com)
#

# Function for crashing semi-gracefully:
CheckError = function(errtext,errcode='U1:'){
	if(errtext != 'ok'){
		# Additionally report command line call
		calltext = paste(commandArgs(),collapse=' ')
		alltext = paste(errtext,calltext)
		# If error, write to std error
		cat(alltext,' ^ \n',file=stderr()); stop(alltext,call. = FALSE)
	}
}
CheckIfAllFailed = function(outinfo){
	# Checks if all requested analyses failed (e.g. in which case don't run summary table function)
	allfail = TRUE
	for(a in 1:length(outinfo)){
		if(is.null(outinfo[[a]]$error)){
			allfail = FALSE
		}
	}
	return(allfail)
}
LegendText = function(data,plotobs=TRUE){
	# Returns text vector of legend names for a plot.
	# If no obs line in the plot (e.g. error plot), first index will be model, else obs
	# If for some reason a benchmark failed (e.g. missing variable), colours are adjusted to make them 
	# consistent across different plots 
	legendtext = c()
	if(plotobs){ # i.e. obs line will be part of the plot
		legendtext[1] = data$obs$name
	}
	legendtext = c(legendtext, data$model$name)
	if(data$bench$exist){
		legendtext = c(legendtext, data$bench[[ data$bench$index[1] ]]$name)
		if(data$bench$howmany == 2){
			legendtext = c(legendtext, data$bench[[ data$bench$index[2] ]]$name)
		}else if(data$bench$howmany == 3){
			legendtext = c(legendtext, data$bench[[ data$bench$index[2] ]]$name)
			legendtext = c(legendtext, data$bench[[ data$bench$index[3] ]]$name)
		}
	}
	return(legendtext)
}
FindRangeViolation = function(varin,varrange){
	offendingValue=0 # init
	for(i in 1:length(varin)){
		if(varin[i]<varrange[1] | varin[i]>varrange[2]){
			offendingValue = varin[i]
			return(offendingValue)
		}
	}
	return(offendingValue) 
}

CheckVersionCompatibility = function(filepath1,filepath2){
	# Given tow netcdf files produced by PALS, checks that
	# they're produced using the same dataset name and version.
	fid1=open.ncdf(filepath1,readunlim=FALSE) # open file 1
	fid2=open.ncdf(filepath2,readunlim=FALSE) # open file 2
	# Get PALS data set name and version for both files:
	DsetName1 = att.get.ncdf(fid1,varid=0,attname='PALS_dataset_name')
	DsetName2 = att.get.ncdf(fid2,varid=0,attname='PALS_dataset_name')
	DsetVer1 = att.get.ncdf(fid1,varid=0,attname='PALS_dataset_version')
	DsetVer2 = att.get.ncdf(fid2,varid=0,attname='PALS_dataset_version')
	if(tolower(DsetName1$value) != tolower(DsetName2$value)){
		#CheckError(paste('B3: Data set name in observed data',
		#	'file and benchmark file is different:',
		#	DsetName1$value,DsetName2$value))
	}
	if(tolower(DsetVer1$value) != tolower(DsetVer2$value)){
		#CheckError(paste('B3: Data set version in observed data',
		#	'file and benchmark file is different:',
		#	DsetVer1$value,DsetVer2$value))
	}
}

BenchmarkInfo = function(BenchmarkFiles,Bctr){
	# Determines the number of user nominated benchmarks in a call to an 
	# experiment script, as well as the number of files associated with each.
	# Bctr - total number of benchmark files
	# BenchmarkFiles - contains data for each file
	# nBench - number of user nominated benchmarks
	# nBenchfiles - a list of vectors of file indices for each benchmark
	if(Bctr == 0){ # no benchmark files sent by javascript
		nBench = 0
		nBenchfiles = NA
		benchnames = NA
	}else{
		nBench = 1
		# Determine number of user nominated benchmarks, and the name of each:
		benchnames = c()
		for(b in 1:Bctr){
			nBench = max(nBench, as.integer(BenchmarkFiles[[b]]$number))
			benchnames[as.integer(BenchmarkFiles[[b]]$number)] = BenchmarkFiles[[b]]$name
		}
		# Store which files belong to which benchmark:
		nBenchfiles = list()
		bexists = c(0)
		for(b in 1:Bctr){
			benchnumber = as.integer(BenchmarkFiles[[b]]$number)
			if(any(bexists == benchnumber)){
				nBenchfiles[[benchnumber]] = c(nBenchfiles[[benchnumber]] , b)
			}else{
				nBenchfiles[[benchnumber]] = c(b)
				bexists = c(bexists,benchnumber)
			}
		}
	}
	result = list(number = nBench, benchfiles=nBenchfiles, names=benchnames)
	return(result)
}
#
# Strips path from filename: 
stripFilename = function(fpath) {
	fsplit = strsplit(fpath,'/')
	fcharvec = as.character(fsplit[[1]])
	fname = fcharvec[length(fcharvec)]
	return(fname)
}
#
# Set raster output graphics file resolution:
getResolution = function(analysisType){
	if(analysisType=='default'){
    	iwidth=1100
    	iheight=800
    }else if(analysisType=='ObsAnalysis'){
    	iwidth=900
    	iheight=600
    }else if(analysisType=='QCplotsSpreadsheet'){
    	iwidth=900
    	iheight=600
    }else if(analysisType=='BenchAnalysis'){
    	iwidth=900
    	iheight=600
    }else{
    	CheckError('I2: Unknown analysis type requested in getResolution.')
    }
    ires = list(width=iwidth,height=iheight)
    return(ires)
}
#
# Set output file type:
setOutput = function(analysisType) {
	outtype = 'png'
	outfilename = paste(uuid(), outtype, sep='.')
	ires = getResolution('default')
#	if(analysisType=='QCplotsSpreadsheet'){
#		fsize = 24	
#	}else{
		fsize = ceiling(ires$width / 1500 * 24) # set font size
#	}
	# Set output file type, if not to screen:
	if (outtype == 'pdf' ) {
		pdf(file=outfilename, paper='a4r', width=11, height=8)
	}else if (outtype=='ps') {
		postscript(file=outfilename, paper='special', width=11, height=8)
	}else if (outtype == 'png') {
		png(file=outfilename, width=ires$width, height=ires$height, pointsize=fsize)
	}else if(outtype == 'jpg'){
		jpeg(file=outfilename, width=ires$width, height=ires$height, pointsize=fsize)
	}else{
		CheckError(paste('I1: Requested output format not recognised:',outtype))
	}
	return(outfilename);
}

# UUID generator:
uuid = function(uppercase=FALSE) {
	## Version 4 UUIDs have the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
	## where x is any hexadecimal digit and y is one of 8, 9, A, or B
	## e.g., f47ac10b-58cc-4372-a567-0e02b2c3d479
 
	hex_digits <- c(as.character(0:9), letters[1:6])
	hex_digits <- if (uppercase) toupper(hex_digits) else hex_digits
	 
	y_digits <- hex_digits[9:12]
	 
	paste(
	  paste0(sample(hex_digits, 8, replace=TRUE), collapse=''),
	  paste0(sample(hex_digits, 4, replace=TRUE), collapse=''),
	  paste0('4', paste0(sample(hex_digits, 3, replace=TRUE), collapse=''), collapse=''),
	  paste0(sample(y_digits,1), paste0(sample(hex_digits, 3, replace=TRUE), collapse=''), collapse=''),
	  paste0(sample(hex_digits, 12, replace=TRUE), collapse=''),
	  sep='-')
}


Prepare4DMatrix = function(data){
  adata = array(NA,dim=c(data$obs$grid$lonlen,data$obs$grid$latlen,data$obs$timing$tsteps,(3+data$bench$howmany)))
  adata[,,,1] = data$obs$data            # obs
  adata[,,,2] = data$obs$data_unc        # obs, std
  adata[,,,3] = data$model$data          # model
  # Add benchmark data, if any:
  if(data$bench$exist){                  # bench
    for(b in 1: (data$bench$howmany) ){
      adata[,,,(b+3)] = data$bench[[data$bench$index[b]]]$data
    }
  }   
  return(adata)
}

Prepare4DMatrix_MultiObs = function(data){
  obscounter = length(data$obs) 
  for(i in 1:length(data$obs)){
    if(data$obs[[i]]$name == "MPI ET" | data$obs[[i]]$name == "LandFlux ET"){
      obscounter = obscounter + 1
    }     
  }
  counter = 1 + data$bench$howmany + obscounter     # dimension of adata
  
  adata = list()
  adata[[1]] = list(data=data$model$data, nm="model", lonlen=data$model$grid$lonlen, lat=data$model$grid$lat,                                   # model
                    years = c(data$model$timing$syear,data$model$timing$syear + ((data$model$timing$tsteps/12)-1)))                                 
  
  add = 2
  for(i in 1:length(data$obs)){
    adata[[add]] = list(data=data$obs[[i]]$data, nm="obs", lonlen=data$obs[[i]]$grid$lonlen, lat=data$obs[[i]]$grid$lat,                         # obs
                        years = c(data$obs[[i]]$timing$syear[1],data$obs[[i]]$timing$syear[1] + ((data$obs[[i]]$timing$tsteps/12)-1)))                          
    add = add +1
    if(data$obs[[i]]$name == "MPI ET" | data$obs[[i]]$name == "LandFlux ET"){
      adata[[add]] = list(data=data$obs[[i]]$data_unc, nm="obs_unc", lonlen=data$obs[[i]]$grid$lonlen, lat=data$obs[[i]]$grid$lat,              # obs, std
                          years = c(data$obs[[i]]$timing$syear[1],data$obs[[i]]$timing$syear[1] + ((data$obs[[i]]$timing$tsteps/12)-1)))                    
      add = add +1
    }
  }
  
  # Add benchmark data, if any:
  if(data$bench$exist){                                                                                                                          # bench
    for(b in 1: (data$bench$howmany) ){
      adata[[(add-1)+b]] = list(data=data$bench[[data$bench$index[b]]]$data, nm="bench", lonlen=data$bench[[data$bench$index[b]]]$grid$lonlen, 
                                lat=data$bench[[data$bench$index[b]]]$grid$lat,
                                years = c(data$bench[[data$bench$index[b]]]$timing$syear[1],data$bench[[data$bench$index[b]]]$timing$syear[1] + ((data$bench[[data$bench$index[b]]]$timing$tsteps/12)-1)))
    }
  }   
  
  return(adata)
}


CreateMask = function(obs,model,bench,type){
  # Obs
  if(type!="MultiObs" & type!="MultiObsMap"){
    mask_obs = array(NA,dim=dim(obs$data[,,1])) # NA values        -> NA
    mask_obs[which(!is.na(obs$data[,,1]))] = 1  # values available -> 1
  }else{
    mask_obs = list()
    for(i in 1:length(obs)){
      mask_obs[[i]] = array(NA,dim=dim(obs[[i]]$data[,,1])) # NA values        -> NA
      mask_obs[[i]][which(!is.na(obs[[i]]$data[,,1]))] = 1  # values available -> 1
    } 
  }
  
  # Model
  if(type!="MultiObsMap"){
    mask_model = array(NA,dim=dim(model$data[,,1])) # NA values        -> NA 
    mask_model[which(!is.na(model$data[,,1]))] = 0  # values available -> 1
  }else{
    mask_model=list()
    for(j in 1:length(model)){
      mask_model[[j]] = array(NA,dim=dim(model[[j]]$data[,,1])) # NA values        -> NA 
      mask_model[[j]][which(!is.na(model[[j]]$data[,,1]))] = 0  # values available -> 1
    }
  }
  
  
  # Bench
  if(bench$exist){
    mask_bench = list()
    for(i in 1:bench$howmany){
      mask_bench[[i]] = array(NA,dim=dim(bench[[i]]$data[,,1])) # NA values        -> NA
      mask_bench[[i]][which(!is.na(bench[[i]]$data[,,1]))] = 0  # values available -> 1
    }    
  }
  
  # Mask areas where all the masks have values
  if(type!="MultiObs" & type!="MultiObsMap"){
    mask = mask_obs + mask_model 
    if(bench$exist){
      for(i in 1:bench$howmany){
        mask = mask + mask_bench[[i]]
      }
    }
  }else if(type=="MultiObs"){
    mask = mask_model 
    if(bench$exist){
      for(i in 1:bench$howmany){
        mask = mask + mask_bench[[i]]
      }
    }
    for(i in 1:length(mask_obs)){
      mask = mask + mask_obs[[i]]
    }
  }else if(type=="MultiObsMap"){
    if(bench$exist){
      mask = list(obs = mask_obs, model = mask_model, bench = mask_bench)
    }else{
      mask = list()
      for(i in 1:length(obs)){
        mask[[i]] = mask_obs[[i]] + mask_model[[i]]
      }
    }
  }
  return(mask) 
}


CategorizeQAData = function(obs,value_threshold,pct_threshold){
  # Initialize arrays
  catdata = array(1, dim=dim(obs$data_QA)[1:2])
  bindata = array(0, dim=dim(obs$data_QA))  
  # Categorize data
  bindata[which((obs$data_QA>value_threshold) & (obs$data_QA!=7) & (obs$data_QA!=6))] = 1 # find "bad quality data" (1=bad and 0=good)
  sumdata = apply(bindata,c(1,2),function(x) sum(na.omit(x))) # How many times is data quality "bad"
  pctdata = (sumdata/obs$timing$tsteps)*100 # How many percentage (# out of 24) is data quality "bad"
  catdata[which(pctdata > pct_threshold)] = NA # NA for "bad quality data", 1 for the rest
  
  return(catdata)
}


FindTimeSegment = function(model,obs){ 
  # Read model year
  myear = c(model$timing$syear : (model$timing$syear + (model$timing$tsteps/12 -1)))
  
  # Read observation years
  oyear = list()
  for(i in 1:length(obs)){
    oyear[[i]] = obs[[i]]$timing$syear
  }
  
  # Select specific years from model
  matchyear = list()
  matchmodel = list()
  for(i in 1:length(obs)){
    matchyear[[i]] = match(oyear[[i]],myear)*12
    matchmodel[[i]] = model$data[,,((matchyear[[i]][1]-11):(matchyear[[i]][length(matchyear[[i]])]))]
  }
  
  modmodel = list()
  for(i in 1:length(obs)){
    modmodel[[i]]= model
    modmodel[[i]]$data = matchmodel[[i]]
    modmodel[[i]]$timing$tsteps = ((oyear[[i]][length(oyear[[i]])] - oyear[[i]][1])+1)*12
    modmodel[[i]]$timing$syear = oyear[[i]][1]
  }
  
  return(modmodel)
}


CalculateAnnualMean = function(data){
  nmonths = dim(data$data)[3]
  mask = array(NA,dim=dim(data$data[,,1])) # NA values        -> NA
  mask[which(!is.na(data$data[,,1]))] = 1  # values available -> 1
  sequence = seq(1,nmonths+1,12)
  aprec = array(NA,dim=c(dim(data$data)[1:2],nmonths/12))
  mprec = array()
  for(i in 1:(nmonths/12)){
    aprec[,,i] = apply(data$data[,,sequence[i]:(sequence[i]-1)], c(1,2), mean, na.rm=T)
    mprec[i] = WeightedMean(lat=data$grid$lat,data=aprec[,,i],mask=mask)
  }
  maprec = mean(mprec,na.rm=T)
  return(maprec)
}
