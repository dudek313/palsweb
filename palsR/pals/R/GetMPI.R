# GetMPI.R
#
# This script fetches MPI ET data
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#

GetMPI_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
library(ncdf4) # load package
errtext='ok'	
if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
  errtext = 'Request for non-Qle, non-Evap variable to GetMPI_Aus read routine.'
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
  ET = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
}else{
  errtext = paste('GetMPI_Aus requested to force to unknown interval:',force_interval)
  obs = list(err=TRUE,errtext=errtext)
  return(obs)	
}
# Get data:
for(f in 1:nyears){ # For each file sent by js		
  # Open file:
  fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
  # Read MPI data for this year:
  if(interval == 'monthly'){
    ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleLEcor_May12' ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
}
# Reopen first file to fetch lat and lon:
fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
# Then get spatial grid structure from first model output file:
grid = GetGrid(fid)
grid$lat <- grid$lat[grid$latlen:1]
ET <- ET[1:grid$lonlen,grid$latlen:1,1:tsteps]

if(grid$err){	
  obs = list(err=TRUE,errtext=grid$errtext)
  nc_close(fid) # Close netcdf file
  return(obs)
}

nc_close(fid)

if(variable[['Name']][1] == 'Qle'){
  ET = ET*11.57 # convert from MJ m-2 d-1 to W/m^2
} 

timing = list(interval=interval,tsteps=tsteps,syear=year)

errtext='ok'

# Return result
obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='MPI ET')
return(obs)	
}

################################################################################################################


GetMPI_uncertainty_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetMPI_Aus read routine.'
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
    ET = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
    ET_unc = array(NA,dim=c(104,72,tsteps))  
  }else{
    errtext = paste('GetMPI_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MPI data for this year:
    if(interval == 'monthly'){
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleLEcor_May12' ) # read model output data
      ET_unc[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'std' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  grid$lat <- grid$lat[grid$latlen:1]
  ET <- ET[1:grid$lonlen,grid$latlen:1,1:tsteps]
  ET_unc <- ET_unc[1:grid$lonlen,grid$latlen:1,1:tsteps]
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*11.57 # convert from MJ m-2 d-1 to W/m^2
    ET_unc = ET_unc*11.57
  } 
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,data_unc=ET_unc,grid=grid,timing=timing,name='MPI ET')
  return(obs)	
}

################################################################################################################

GetMPI_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetMPI_Global read routine.'
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
		ET = array(NA,dim=c(720,360,tsteps))	# Initialise data array:
	}else{
		errtext = paste('GetMPI_Global requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
		# Read MPI data for this year:
		if(interval == 'monthly'){
			ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleLEcor_May12' ) # read model output data      
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
	#latitude=latitude[360:1] # 1:360 (-90..90)
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
	
	if(variable[['Name']][1] == 'Qle'){
	  ET = ET*11.57 # convert from MJ m-2 d-1 to W/m^2
	}
  
  ET_tmp=ET
  ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
	ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  ET=ET_tmp
  
	timing = list(interval=interval,tsteps=tsteps,syear=year)
	
  errtext='ok'
  
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='MPI ET')
	return(obs)	
}


###############################################################################################################

GetMPI_uncertainty_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'	
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetMPI_uncertainty_Global read routine.'
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
    ET = array(NA,dim=c(720,360,tsteps))	# Initialise data array:
    ET_unc = array(NA,dim=c(720,360,tsteps))
  }else{
    errtext = paste('GetMPI_uncertainty_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MPI data for this year:
    if(interval == 'monthly'){
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'EnsembleLEcor_May12' ) # read model output data    
      ET_unc[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'std' )
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
  #latitude=latitude[360:1] # 1:360 (-90..90)
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
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*11.57 # convert from MJ m-2 d-1 to W/m^2
    ET_unc = ET_unc*11.57
  }
  
  # ET
  ET_tmp=ET
  ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
  ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  ET=ET_tmp

  # ET_unc
  ETu_tmp=ET_unc
  ETu_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET_unc[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
  ETu_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET_unc[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  ET_unc=ETu_tmp
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,data_unc=ET_unc,grid=grid,timing=timing,name='MPI ET')
  return(obs)	
}