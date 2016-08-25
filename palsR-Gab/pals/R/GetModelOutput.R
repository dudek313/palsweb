# GetModelOutput.R
#
# Reads a variable from model output netcdf file
# Gab Abramowitz UNSW 2014 (palshelp at gmail dot com)
#
GetModelOutput = function(variable,name,filepaths,forcegrid='no'){
	library(ncdf4) # load netcdf library
	errtext='ok'
	
	mfid=list() # initialise netcdf file ID list
	modeltiming = list() # initialise list of each file's timing details
	
	# First check that each file exists, contains the variable we want, has known units,
	# and known timing structure:
	for(f in 1:length(filepaths)){ # For each file of this MO:
		# Check file exists:
		if(!file.exists(filepaths[f])){
			errtext = paste('Model output file',filepaths[f],'does not exist.')
			model=list(errtext=errtext,err=TRUE)
			return(model)	
		}
		# Open model output file
		mfid[[f]]=nc_open(filepaths[f],write=FALSE,readunlim=FALSE)
		# Check that requested variable exists:
		exists = AnyNcvarExists(mfid[[f]],variable[['Name']])
		if( ! exists$var){
			errtext = paste('Requested variable',variable[['Name']][1],
				'does not appear to exist in Model Ouput:', name)
			model=list(errtext=errtext,err=TRUE)
			mfid = lapply(mfid, nc_close)
			return(model)
		}
		# Check variable units are known:
		units = CheckNcvarUnits(mfid[[f]],variable[['Name']][exists$index],variable,filepaths[f])
		# If units issue, return error:
		if(units$err){
			model=list(errtext=units$errtext,err=TRUE)
			mfid = lapply(mfid, nc_close)
			return(model)
		}
		# Get timing details for each file:
		modeltiming[[f]] = GetTimingNcfile(mfid[[f]])
		# If timing issue, return error:
		if(modeltiming[[f]]$err){
			model=list(errtext=modeltiming[[f]]$errtext,err=TRUE)
			mfid = lapply(mfid, nc_close)
			return(model)
		}
	}
	# Then get spatial grid structure from first model output file:
	grid = GetGrid(mfid[[1]])
	if(grid$err){	
		model = list(err=TRUE,errtext=grid$errtext)
		mfid = lapply(mfid, nc_close)
		return(model)
	}
	
	# Now try to ascertain how the data in these files needs to be assembled:
	allintervals = c()
	alltsteps = c()
	allyear = c()
	for(f in 1:length(filepaths)){
		allintervals[f] = modeltiming[[f]]$interval
		alltsteps[f] = modeltiming[[f]]$tsteps
		allyear[f] = modeltiming[[f]]$syear
	}
	########### Monthly data in one year files ####################
	if((all(allintervals == 'monthly')) && (all(alltsteps == 12))){		
		# i.e. all are monthly data in year length files
		nyears = length(filepaths)
		ntsteps = 12 * nyears # total number of time steps
		
		# Check that MO files don't repeat years:
		if(length(unique(allyear)) != length(allyear)){ # i.e. a repeated year has been removed
			errtext='Model output has two files with the same starting year.'
			model = list(err=TRUE,errtext=errtext)
			mfid = lapply(mfid, nc_close)
			return(model)
		}
		
		# Allocate space for data:
		vdata = array(NA,dim=c(grid$lonlen,grid$latlen,ntsteps) )
		# Define the order to read files:
		fileorder = order(allyear)
		
		# Check there are no gaps in years:
		if(nyears>1){
			descending_years = rev(allyear[fileorder])
			gap_bw_files = descending_years[1:(nyears-1)] - descending_years[2:nyears]
			if(any(gap_bw_files != 1)){
				errtext='Model output is missing some years.'
				model = list(err=TRUE,errtext=errtext)
				mfid = lapply(mfid, nc_close)
				return(model)
			}
		}
		
		# Get data:
		for(f in 1:length(filepaths)){ # For each file sent by js
			vdata[,,((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(mfid[[ fileorder[f] ]],variable[['Name']][exists$index])
		}
		# Create model timing list to reflect aggregated data:
		modeltimingall = list(tstepsize=modeltiming[[1]]$tstepsize,tsteps=ntsteps,
			syear=modeltiming[[1]]$syear,smonth=modeltiming[[1]]$smonth,sdoy=modeltiming[[1]]$sdoy,
			interval=modeltiming[[1]]$interval)
	########### Model time step data with same number of time steps in each file ####################
	}else if((all(allintervals == 'timestep')) && (all(alltsteps == alltsteps[1]))){
		# i.e. all are per time step data with the same number of time steps in each file
		ntsteps = alltsteps[1] * length(filepaths) # total number of time steps
		tsteps1 = alltsteps[1]
		
		# Allocate space for data:
		vdata = array(NA,dim=c(grid$lonlen,grid$latlen,ntsteps) )
		# Define the order to read files:
		fileorder = order(allyear)
		# Get data:
		if(mfid[[1]]$var[[exists$index]]$name=='FCEV'){ # lat heat in CLM has 3 components
			for(f in 1:length(filepaths)){ # For each file sent by js
				vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] = 
					ncvar_get(mfid[[ fileorder[f] ]],'FCEV')
				vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] = 
					vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] +
					ncvar_get(mfid[[ fileorder[f] ]],'FCTR')
				vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] = 
					vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] + 
					ncvar_get(mfid[[ fileorder[f] ]],'FGEV')
			}
		}else{
			for(f in 1:length(filepaths)){ # For each file sent by js
				vdata_tmp = ncvar_get(mfid[[ fileorder[f] ]],variable[['Name']][exists$index],collapse_degen=FALSE)

				if ((variable[['Name']][1]=='NEE') & (length(vdata_tmp) != (ntsteps*grid$lonlen*grid$latlen))) {
					# likely an ORCHIDEE file where NEE has dim (x,y,t,vegtype), in which case sum over
					# vegtype dim - NEE values are already weighted by vegtype fraction:
					vdata_tmp = apply(vdata_tmp,c(1,2,4),sum)
				}
				if(length(vdata_tmp) != (ntsteps*grid$lonlen*grid$latlen)){
					errtext = paste('Requested variable',variable[['Name']][1],
							'has more dimensions than expected in Model Ouput:', name)
					model = list(err=TRUE,errtext=errtext)
					mfid = lapply(mfid, nc_close)
					return(model)
				}

				vdata[,,((f-1)*tsteps1+1) : ((f-1)*tsteps1+tsteps1)] = vdata_tmp
			}
		}
		# Create model timing list to reflect aggregated data:
		modeltimingall = list(tstepsize=modeltiming[[1]]$tstepsize,tsteps=ntsteps,
			syear=modeltiming[[1]]$syear,smonth=modeltiming[[1]]$smonth,sdoy=modeltiming[[1]]$sdoy,
			interval=modeltiming[[1]]$interval)
	}else{
		errtext='PALS is not currently able to read model output files with this timing structure.'
		model = list(err=TRUE,errtext=errtext)
		mfid = lapply(mfid, nc_close)
		return(model)
	}
	
	# Close all files for this model output:
	mfid = lapply(mfid, nc_close)
	
	# Apply any units changes:
	vdata = vdata*units$multiplier + units$addition
	
	# Assess nature of grid here
	
	# If not equal to requested grid structure (if forcegrid != 'no'), reshape data here
	
	# Create list to return from function:	
	model=list(data=vdata,timing = modeltimingall,name=name,grid=grid,
		err=FALSE,errtext=errtext)
	return(model)
}

GetBenchmarks = function(variable,BenchmarkInfo){
	# Collects the model outputs that form benchmark simulations as a list
	errtext = 'ok'
	bench = list() # initialise benchmark data llist
	if(BenchmarkInfo$number > 0){
		# Save for nBench$number positions in list for benchmark data;
		# they'll be filled shortly:
		for(b in 1:BenchmarkInfo$number){
			bench[[b]] = 0
		}
	    	bench[['exist']] = TRUE
	    	bench[['howmany']] = 0 # number that have no errors
	    	bench[['index']] = c()
	    	bench[['errtext']] = ' '
	    	for(b in 1:BenchmarkInfo$number){
	    		bench[['howmany']] = bench[['howmany']] + 1
		    	bench[[b]] = GetModelOutput(variable,BenchmarkInfo$unit[[b]]$name,BenchmarkInfo$unit[[b]]$filepaths)
		    	if(bench[[b]]$err){ # i.e. there was an error of some sort retrieving benchmark
		    		# Add to this benchamrk's errtext field - note it's a benchmark:
		    		bench[[b]]$errtext = paste('Benchmark error: ',bench[[b]]$errtext,sep='')
		    		bench[['errtext']] = paste(bench[['errtext']],'Benchmark ',b,': ',bench[[b]]$errtext,sep='')
		    		# decrease the number of benchmarks available for this variable:
		    		bench[['howmany']] = bench[['howmany']] - 1
		    	}else{
		    		# Note which benchmarks didn't fail:
		    		bench[['index']] = c(bench[['index']],b)
		    	}	
	    }
	    # If reading of all benchmarks failed, note that there are none:
	    if(bench[['howmany']] == 0){
	    	bench[['exist']] = FALSE	
	    }
	}else{
		bench[['exist']] = FALSE
		bench[['howmany']] = 0
		bench[['errtext']] = 'No user nominated benchmarks.'
		bench[['err']] = TRUE
	}
	return(bench)
}

PruneBenchmarks = function(obs,bench){
	# Test benchmark timing compatibility, and remove benchmark(s) if necessary:
	if(bench$exist){
		# We'll need to use bench$index inside the for loop and also want to 
		# modify it for future use, so modify new_benchindex instead, then overwrite bench$index:
		new_benchindex = bench$index
		for(b in 1: bench$howmany){
			# Check benchmark and obs timing are compatible:
			tcheck = CheckTiming(obs$timing,bench[[ bench$index[b] ]]$timing,benchmark_timing=TRUE)
			if(tcheck$err){
				# Report error with benchmark
				bench$errtext = paste(bench$errtext,'Benchmark',bench$index[b],':',tcheck$errtext)
				bench[[bench$index[b]]]$errtext = tcheck$errtext
				# Remove benchmark from benchmark list:
				bench$howmany = bench$howmany - 1
				if(bench$howmany == 0){
					# If that was the only benchmark, note there no longer any:
					bench$exist = FALSE
				}else{
					# Change index of appropriate benchmarks:
					oldlength = length(new_benchindex)
					if(b==1){
						new_benchindex = new_benchindex[2:oldlength]
					}else if(b==oldlength){	
						new_benchindex = new_benchindex[1:(oldlength-1)]
					}else{
						new_benchindex = 
							c(new_benchindex[1:(b-1)],new_benchindex[(b+1):oldlength])
					}
				}
			}
		}
		# Overwrite bench$index with values that account for any benchmarks that failed:
		bench$index = new_benchindex
	}
	return(bench)	
}