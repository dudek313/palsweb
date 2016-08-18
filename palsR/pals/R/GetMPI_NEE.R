# GetMPI_NEE.R
#
# This script fetches MPI NEE data
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#

GetMPI_NEE_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
library(ncdf4) # load package
errtext='ok'	
if((variable[['Name']][1] != 'NEE') && (variable[['Name']][1] != 'FCO2')){
  errtext = 'Request for non-NEE, non-FCO2 variable to GetMPI_NEE_Aus read routine.'
  obs = list(err=TRUE,errtext=errtext)
  return(obs)
}
nyears = length(filelist)
year = c() 
for(f in 1:nyears){ # For each file sent by js
  # Establish which year the file contains:
  year[f] = as.numeric(substr(filelist[[f]][['path']], 
                              (nchar(filelist[[f]][['path']])-6), (nchar(filelist[[f]][['path']])-3) ) )
}
# Define the order to read files:
fileorder = order(year)	
# Define number of days in total:
if((force_interval == 'no') | (force_interval == 'monthly')){
  interval = 'monthly'
  tsteps = nyears*12
  NEE = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
}else{
  errtext = paste('GetMPI_NEE_Aus requested to force to unknown interval:',force_interval)
  obs = list(err=TRUE,errtext=errtext)
  return(obs)	
}
# Get data:
for(f in 1:nyears){ # For each file sent by js		
  # Open file:
  fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
  # Read MPI data for this year:
  if(interval == 'monthly'){
    NEE[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleNEEcor_May12' ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
}
# Reopen first file to fetch lat and lon:
fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
# Then get spatial grid structure from first model output file:
grid = GetGrid(fid)
grid$lat <- grid$lat[grid$latlen:1]
NEE <- NEE[1:grid$lonlen,grid$latlen:1,1:tsteps]

if(grid$err){	
  obs = list(err=TRUE,errtext=grid$errtext)
  nc_close(fid) # Close netcdf file
  return(obs)
}

nc_close(fid)

if(variable[['Name']][1] == 'NEE'){
  NEE = NEE*3.54 # convert from gC m-2 d-1 to mumolCO2 m-2 s-1 (convert from C to CO2)
}

timing = list(interval=interval,tsteps=tsteps)

errtext='ok'

# Return result
obs = list(err=FALSE,errtext=errtext,data=NEE,grid=grid,timing=timing,name='MPI NEE')
return(obs)	
}

#####################################################################################

GetMPI_NEE_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	errtext='ok'	
	if((variable[['Name']][1] != 'NEE') && (variable[['Name']][1] != 'FCO2')){
		errtext = 'Request for non-NEE, non-FCO2 variable to GetMPI_NEE_Global read routine.'
		obs = list(err=TRUE,errtext=errtext)
		return(obs)
	}
	nyears = length(filelist)
	year = c() 
	for(f in 1:nyears){ # For each file sent by js
		# Establish which year the file contains:
		year[f] = as.numeric(substr(filelist[[f]][['path']], 
			(nchar(filelist[[f]][['path']])-6), (nchar(filelist[[f]][['path']])-3) ) )
	}
	# Define the order to read files:
	fileorder = order(year)	
	# Define number of days in total:
	if((force_interval == 'no') | (force_interval == 'monthly')){
		interval = 'monthly'
		tsteps = nyears*12
		NEE = array(NA,dim=c(720,360,tsteps))	# Initialise data array:
	}else{
		errtext = paste('GetMPI_NEE_Global requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
		# Read MPI data for this year:
		if(interval == 'monthly'){
			NEE[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleNEEcor_May12' ) # read model output data      
			latitude= ncvar_get(fid, 'latitude' ) # 1:360 (90..-90)
			longitude= ncvar_get(fid, 'longitude' ) # 1:720 (-180..180)
		}	
		# Close netcdf file for this year:
		nc_close(fid)
	}
	# Reopen first file to fetch lat and lon:
	fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
	# Then get spatial grid structure from first model output file:
	grid = GetGrid(fid)
  
	# make changes to grid$lon and grid$lat
	latitude=t(kronecker(matrix(1,1,grid$lonlen),latitude[grid$latlen:1])) # 1:720..1:360
	longitude=c(longitude[((grid$lonlen/2)+1):grid$lonlen],longitude[1:(grid$lonlen/2)]+360) # 1:720
	longitude=(kronecker(matrix(1,1,grid$latlen),longitude)) # 1:720..1:360
	grid$lat<-latitude
	grid$lon<-longitude
  
	if(grid$err){	
		obs = list(err=TRUE,errtext=grid$errtext)
		nc_close(fid) # Close netcdf file
		return(obs)
	}
  
	nc_close(fid)
	
	if(variable[['Name']][1] == 'NEE'){
	  NEE = NEE*3.54 # convert from gC m-2 d-1 to mumolCO2 m-2 s-1 (convert from C to CO2)
	}
  
  NEE_tmp=NEE
  NEE_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=NEE[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
	NEE_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=NEE[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  NEE=NEE_tmp
  
	timing = list(interval=interval,tsteps=tsteps)
	
  errtext='ok'
  
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=NEE,grid=grid,timing=timing,name='MPI NEE')
	return(obs)	
}