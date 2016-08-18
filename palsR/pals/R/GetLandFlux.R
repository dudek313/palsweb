# GetLandFlux.R
#
# This script fetches MPI ET data
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#

GetLandFlux_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
library(ncdf4) # load package
errtext='ok'	
if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
  errtext = 'Request for non-Qle, non-Evap variable to GetLandFlux_Aus read routine.'
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
  ET = array(NA,dim=c(52,36,tsteps))	# Initialise data array:
}else{
  errtext = paste('GetLandFlux_Aus requested to force to unknown interval:',force_interval)
  obs = list(err=TRUE,errtext=errtext)
  return(obs)	
}
# Get data:
for(f in 1:nyears){ # For each file sent by js		
  # Open file:
  fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
  # Read LandFlux data for this year:
  if(interval == 'monthly'){
    ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_mean' ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
}
# Reopen first file to fetch lat and lon:
fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
# Then get spatial grid structure from first model output file:
grid = GetGrid(fid)
##grid$lat <- grid$lat[36:1]
##ET <- ET[1:52,36:1,1:24]

if(grid$err){	
  obs = list(err=TRUE,errtext=grid$errtext)
  nc_close(fid) # Close netcdf file
  return(obs)
}

nc_close(fid)

if(variable[['Name']][1] == 'Qle'){
  ET = ET*28.34467 #0.03525 # convert from mm/day to W/m^2
}

timing = list(interval=interval,tsteps=tsteps,syear=year)

errtext='ok'

# Return result
obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='LandFlux ET')
return(obs)	
}

#####################################################################################################################

GetLandFlux_uncertainty_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetLandFlux_uncertainty_Aus read routine.'
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
    ET = array(NA,dim=c(52,36,tsteps))	# Initialise data array:
    ET_unc = array(NA,dim=c(52,36,tsteps))
  }else{
    errtext = paste('GetLandFlux_uncertainty_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read LandFlux data for this year:
    if(interval == 'monthly'){
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_mean' ) # read model output data
      ET_unc[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_sd' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.34467 #0.03525 # convert from mm/day to W/m^2
    ET_unc = ET_unc*28.34467
  }
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,data_unc=ET_unc,grid=grid,timing=timing,name='LandFlux ET')
  return(obs)	
}

#####################################################################################################################

GetLandFlux_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetLandFlux_Global read routine.'
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
		ET = array(NA,dim=c(360,180,tsteps))	# Initialise data array:
	}else{
		errtext = paste('GetLandFlux_Global requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
		# Read LandFlux data for this year:
		if(interval == 'monthly'){
			ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_mean' ) # read model output data    
			latitude= ncvar_get(fid, 'lat' ) # 1:180 (-89.5..89.5)
			longitude= ncvar_get(fid, 'lon' ) # 1:360 (-179.5..179.5)
		}	
		# Close netcdf file for this year:
		nc_close(fid)
	}
	# Reopen first file to fetch lat and lon:
	fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
	# Then get spatial grid structure from first model output file:
	grid = GetGrid(fid)
  
  # Change longitude from -180 to 180 -> 0 to 360
	longitude=c(longitude[((grid$lonlen/2)+1):grid$lonlen],longitude[1:(grid$lonlen/2)]+360)
	grid$lon<-longitude
	ET_tmp=ET
	ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
	ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
	ET=ET_tmp
  
	if(grid$err){	
		obs = list(err=TRUE,errtext=grid$errtext)
		nc_close(fid) # Close netcdf file
		return(obs)
	}
  
	nc_close(fid)
	
	if(variable[['Name']][1] == 'Qle'){
	  ET = ET*28.34467 #0.03525 # convert from mm/day to W/m^2
	}
  
	timing = list(interval=interval,tsteps=tsteps,syear=year)
	
  errtext='ok'
  
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='LandFlux ET')
	return(obs)	
}

#####################################################################################################################

GetLandFlux_uncertainty_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'	
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetLandFlux_uncertainty_Global read routine.'
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
    ET = array(NA,dim=c(360,180,tsteps))	# Initialise data array:
    ET_unc = array(NA,dim=c(360,180,tsteps))
  }else{
    errtext = paste('GetLandFlux_uncertainty_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read LandFlux data for this year:
    if(interval == 'monthly'){
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_mean' ) # read model output data 
      ET_unc[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET_sd' )
      latitude= ncvar_get(fid, 'lat' ) # 1:180 (-89.5..89.5)
      longitude= ncvar_get(fid, 'lon' ) # 1:360 (-179.5..179.5)
    }	
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  # Change longitude from -180 to 180 -> 0 to 360
  longitude=c(longitude[((grid$lonlen/2)+1):grid$lonlen],longitude[1:(grid$lonlen/2)]+360)
  grid$lon<-longitude
  ET_tmp=ET
  ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ET=ET_tmp
  
  ETu_tmp=ET_unc
  ETu_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET_unc[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ETu_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET_unc[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ET_unc=ETu_tmp
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.34467 #0.03525 # convert from mm/day to W/m^2
    ET_unc = ET_unc*28.34467
  }
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,data_unc=ET_unc,grid=grid,timing=timing,name='LandFlux ET')
  return(obs)	
}