# GetGriddedDataSets.R
#
# Functions to analyse and retrieve gridded PALS Data Sets (i.e. data sets for driving or evaluating models)
#
# Gab Abramowitz, UNSW, 2016 (palshelp at gmail dot com)

KnownGriddedDataSets = function(){
	# The names contained here are searched for as a global attribute "PALS_identifier"
		knownDS = list(name=c('GLEAM'))
}

# Fetches GLEAM ET data
GetGLEAM_Aus = function(variable,filepaths,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	# Should really access complete GLEAM data files and pull out Aus,
	# but for now...
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Aus read routine.'
		obs = list(err=TRUE,errtext=errtext)
		return(obs)
	}
	nyears = length(filepaths)
	year = c() 
	for(f in 1:nyears){ # For each file sent by js
		# Establish which year the file contains:
		year[f] = as.numeric(substr(filepaths[f], 
			(nchar(filepaths[f])-6), (nchar(filepaths[f])-3) ) )
	}
	# Define the order to read files:
	fileorder = order(year)	
	# Define number of days in total:
	yds = Yeardays(min(year),nyears*366)
	daysvector = yds$daysperyear
	ndays = sum(daysvector[1:nyears])
	dayctr = 1 # initialise
	if((force_interval == 'no') | (force_interval == 'daily')){
		interval = 'daily'
		tsteps = ndays
		ET = array(NA,dim=c(208,143,ndays))	# Initialise data array:
	}else if(force_interval == 'monthly'){
		interval = 'monthly'
		tsteps = nyears*12
		ET = array(NA,dim=c(208,143,tsteps))	# Initialise data array:
	}else{
		errtext = paste('GLEAM_Aus requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filepaths[ fileorder[f] ],write=FALSE,readunlim=FALSE)
		# Read GLEAM data for this year:
		if(interval == 'daily'){
			ET[,,dayctr:(dayctr + daysvector[f] - 1)] = ncvar_get(fid, 'EVAP' ) # read model output data
		}else if(interval == 'monthly'){
			tmp = ncvar_get(fid, 'EVAP' ) # read model output data
			ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = DailyToMonthly(tmp,year[fileorder[f]],daysvector[f])
		}	
		# Increment counter:
		dayctr = dayctr + daysvector[f]
		# Close netcdf file for this year:
		nc_close(fid)
	}
	# Reopen first file to fetch lat and lon:
	fid = nc_open(filepaths[ 1 ],write=FALSE,readunlim=FALSE)
	# Then get spatial grid structure from first model output file:
	grid = GetGrid(fid)
	if(grid$err){	
		obs = list(err=TRUE,errtext=grid$errtext)
		nc_close(fid) # Close netcdf file
		return(obs)
	}
	nc_close(fid) # Close netcdf file
	
	if(variable[['Name']][1] == 'Qle'){
		ET = ET*28.4 # convert from mm/day to W/m^2
	}
	
	timing = list(interval=interval,tsteps=tsteps)
	
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM ET')
	return(obs)	
}

GetGLEAM_Global = function(variable,filepaths,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Global read routine.'
		obs = list(err=TRUE,errtext=errtext)
		return(obs)
	}
	nyears = length(filepaths)
	year = c() 
	for(f in 1:nyears){ # For each file sent by js
		# Establish which year the file contains:
		year[f] = as.numeric(substr(filepaths[f], 
			(nchar(filepaths[f])-6), (nchar(filepaths[f])-3) ) )
	}
	# Define the order to read files:
	fileorder = order(year)	
	# Define number of days in total:
	if((force_interval == 'no') | (force_interval == 'monthly')){
		interval = 'monthly'
		tsteps = nyears*12
		ET = array(NA,dim=c(720,360,tsteps))	# Initialise data array:
	}else{
		errtext = paste('GetGLEAM_Global requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filepaths[ fileorder[f] ],write=FALSE,readunlim=FALSE)
		# Read GLEAM data for this year:
		if(interval == 'monthly'){
			ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'et' ) # read model output data
		}	
		# Close netcdf file for this year:
		nc_close(fid)
	}
	# Reopen first file to fetch lat and lon:
	fid = nc_open(filepaths[ 1 ],write=FALSE,readunlim=FALSE)
	# Then get spatial grid structure from first model output file:
	grid = GetGrid(fid)
	if(grid$err){	
		obs = list(err=TRUE,errtext=grid$errtext)
		nc_close(fid) # Close netcdf file
		return(obs)
	}
	nc_close(fid)
	
	timing = list(interval=interval,tsteps=tsteps)
	
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM ET')
	return(obs)	
}


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

GetMODIS_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
library(ncdf4) # load package
errtext='ok'	
if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
  errtext = 'Request for non-Qle, non-Evap variable to GetMODIS_Aus read routine.'
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
  errtext = paste('GetMODIS_Aus requested to force to unknown interval:',force_interval)
  obs = list(err=TRUE,errtext=errtext)
  return(obs)	
}
# Get data:
for(f in 1:nyears){ # For each file sent by js		
  # Open file:
  fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
  # Read MODIS data for this year:
  if(interval == 'monthly'){
    ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'ET' ) # read model output data 
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

timing = list(interval=interval,tsteps=tsteps,syear=year)

errtext='ok'

# Return result
obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='MOD16 ET')
return(obs)	
}

#########################################################################################

GetMODIS_VISalbedo_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'VISalbedo'){
    errtext = 'Request for non-VISalbedo variable to GetMODIS_VISalbedo_Aus read routine.'
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
    ALB = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
  }else{
    errtext = paste('GetMODIS_VISalbedo_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'VISalbedo' ) # read model output data 
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
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,grid=grid,timing=timing,name='MCD43GF_VISalbedo')
  return(obs)	
}

#########################################################################################
## With QA value

GetMODIS_VISalbedo_QA_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'VISalbedo'){
    errtext = 'Request for non-VISalbedo variable to GetMODIS_VISalbedo_QA_Aus read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  # Separate filelist
  sepfile = SeparateFilelist(filelist)
  
  nyears = length(sepfile$var)
  year = c() 
  for(f in 1:nyears){ # For each file sent by js
    # Establish which year the file contains:
    year[f] = as.numeric(substr(sepfile$var[[f]][['path']], 
                                (nchar(sepfile$var[[f]][['path']])-6), (nchar(sepfile$var[[f]][['path']])-3) ) )
  }
  # Define the order to read files:
  fileorder = order(year)  
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    tsteps = nyears*12
    ALB = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
    QA = array(NA,dim=c(104,72,tsteps))
  }else{
    errtext = paste('GetMODIS_VISalbedo_QA_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(sepfile$var[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    fidqa = nc_open(sepfile$QA[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'VISalbedo' ) # read model output data 
      QA[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fidqa, 'VISalbedoQA' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
    nc_close(fidqa)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(sepfile$var[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,data_QA=QA,grid=grid,timing=timing,name='MCD43GF_VISalbedo')
  return(obs)	
}


#########################################################################################3

GetMODIS_NIRalbedo_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'NIRalbedo'){
    errtext = 'Request for non-NIRalbedo variable to GetMODIS_NIRalbedo_Aus read routine.'
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
    ALB = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
  }else{
    errtext = paste('GetMODIS_NIRalbedo_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'NIRalbedo' ) # read model output data 
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
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,grid=grid,timing=timing,name='MCD43GF_NIRalbedo')
  return(obs)	
}

#########################################################################################
## With QA value

GetMODIS_NIRalbedo_QA_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'NIRalbedo'){
    errtext = 'Request for non-NIRalbedo variable to GetMODIS_NIRalbedo_QA_Aus read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  # Separate filelist
  sepfile = SeparateFilelist(filelist)
  
  nyears = length(sepfile$var)
  year = c() 
  for(f in 1:nyears){ # For each file sent by js
    # Establish which year the file contains:
    year[f] = as.numeric(substr(sepfile$var[[f]][['path']], 
                                (nchar(sepfile$var[[f]][['path']])-6), (nchar(sepfile$var[[f]][['path']])-3) ) )
  }
  # Define the order to read files:
  fileorder = order(year)  
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    tsteps = nyears*12
    ALB = array(NA,dim=c(104,72,tsteps))  # Initialise data array:
    QA = array(NA,dim=c(104,72,tsteps))
  }else{
    errtext = paste('GetMODIS_NIRalbedo_QA_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(sepfile$var[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    fidqa = nc_open(sepfile$QA[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'NIRalbedo' ) # read model output data 
      QA[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fidqa, 'NIRalbedoQA' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(sepfile$var[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,data_QA=QA,grid=grid,timing=timing,name='MCD43GF_NIRalbedo')
  return(obs)	
}


#########################################################################################3


GetMODIS_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'	
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetMODIS_Global read routine.'
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
    errtext = paste('GetMODIS_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'et' ) # read model output data
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
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='MOD16 ET')
  return(obs)	
}


#########################################################################################3

GetMODIS_VISalbedo_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'VISalbedo')){
    errtext = 'Request for non-VISalbedo variable to GetMODIS_VISalbedo_Global read routine.'
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
    ALB = array(NA,dim=c(720,360,tsteps))	# Initialise data array: 
  }else{
    errtext = paste('GetMODIS_VISalbedo_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'VISalbedo' ) # read model output data
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
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  ALB_tmp=ALB
  ALB_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ALB[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ALB_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ALB[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ALB=ALB_tmp
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,grid=grid,timing=timing,name='MCD43GF_VISalbedo')
  return(obs)	
}


#########################################################################################3
# With QA values

GetMODIS_VISalbedo_QA_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'VISalbedo')){
    errtext = 'Request for non-VISalbedo variable to GetMODIS_VISalbedo_Global read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  # Separate filelist
  sepfile = SeparateFilelist(filelist)
  
  nyears = length(sepfile$var)
  year = c() 
  for(f in 1:nyears){ # For each file sent by js
    # Establish which year the file contains:
    year[f] = as.numeric(substr(sepfile$var[[f]][['path']], 
                                (nchar(sepfile$var[[f]][['path']])-6), (nchar(sepfile$var[[f]][['path']])-3) ) )
  }
  # Define the order to read files:
  fileorder = order(year)  
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    tsteps = nyears*12
    ALB = array(NA,dim=c(720,360,tsteps))	# Initialise data array: 
    QA = array(NA,dim=c(720,360,tsteps))
  }else{
    errtext = paste('GetMODIS_VISalbedo_QA_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(sepfile$var[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    fidqa = nc_open(sepfile$QA[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'VISalbedo' ) # read model output data
      QA[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fidqa, 'VISalbedoQA' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
    nc_close(fidqa)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(sepfile$var[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  nc_close(fid)
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  ALB_tmp=ALB
  ALB_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ALB[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ALB_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ALB[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ALB=ALB_tmp
  
  QA_tmp=QA
  QA_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=QA[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  QA_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=QA[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  QA=QA_tmp
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,data_QA=QA,grid=grid,timing=timing,name='MCD43GF_VISalbedo')
  return(obs)	
}


#########################################################################################3

GetMODIS_NIRalbedo_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'NIRalbedo')){
    errtext = 'Request for non-NIRalbedo variable to GetMODIS_NIRalbedo_Global read routine.'
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
    ALB = array(NA,dim=c(720,360,tsteps))	# Initialise data array: 
  }else{
    errtext = paste('GetMODIS_NIRalbedo_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'NIRalbedo' ) # read model output data
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
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  ALB_tmp=ALB
  ALB_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ALB[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ALB_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ALB[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ALB=ALB_tmp
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,grid=grid,timing=timing,name='MCD43GF_NIRalbedo')
  return(obs)	
}

#########################################################################################3
# With QA values

GetMODIS_NIRalbedo_QA_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'NIRalbedo')){
    errtext = 'Request for non-NIRalbedo variable to GetMODIS_NIRalbedo_Global read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  # Separate filelist
  sepfile = SeparateFilelist(filelist)
  
  nyears = length(sepfile$var)
  year = c() 
  for(f in 1:nyears){ # For each file sent by js
    # Establish which year the file contains:
    year[f] = as.numeric(substr(sepfile$var[[f]][['path']], 
                                (nchar(sepfile$var[[f]][['path']])-6), (nchar(sepfile$var[[f]][['path']])-3) ) )
  }
  # Define the order to read files:
  fileorder = order(year)  
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    tsteps = nyears*12
    ALB = array(NA,dim=c(720,360,tsteps))  # Initialise data array: 
    QA = array(NA,dim=c(720,360,tsteps)) 
  }else{
    errtext = paste('GetMODIS_NIRalbedo_QA_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(sepfile$var[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    fidqa = nc_open(sepfile$QA[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read MODIS data for this year:
    if(interval == 'monthly'){
      ALB[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fid, 'NIRalbedo' ) # read model output data
      QA[,, ((f-1)*12+1) : ((f-1)*12+12)] = ncvar_get(fidqa, 'NIRalbedoQA' )
    }	
    # Close netcdf file for this year:
    nc_close(fid)
    nc_close(fidqa)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(sepfile$var[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  nc_close(fid)
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  ALB_tmp=ALB
  ALB_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ALB[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  ALB_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ALB[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  ALB=ALB_tmp
  
  QA_tmp=QA
  QA_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=QA[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  QA_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=QA[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  QA=QA_tmp
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ALB,data_QA=QA,grid=grid,timing=timing,name='MCD43GF_NIRalbedo')
  return(obs)	
}


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

GetHadCRUT = function(dsetversion,years,missing_threshold){
	cat(paste('Loading HadCRUT version',dsetversion,' \n'))
	library(ncdf) # load packages
	source('~/results/indep_application/functions/missing_data.R')
	remove_missing = TRUE
	if(missing_threshold==100){remove_missing = FALSE}
	meanfile='~/data/global/CRU/absolute.nc' # mean temperatures file
	if(dsetversion==3){
		anfile='~/data/global/CRU/HadCRUT3.nc' # anomaly temperatures file
	}else if(dsetversion==4){
		anfile='~/data/global/CRU/HadCRUT.4.2.0.0.median.nc' # anomaly temperatures file
	}else{
		stop('Unknown version of HadCRUT requested.')	
	}
	# Calculate month count:
	mcount = (years[2]-years[1])*12 + 12
	# Calculate start month
	smonth = (years[1]-1850)*12 + 1
	# Cacluate number of years
	nyears = years[2]-years[1] + 1
	mn=open.ncdf(meanfile,readunlim=FALSE) # open global mean temp file
	an=open.ncdf(anfile,readunlim=FALSE) # open global anomaly temp file
	# Meantemp is of dimension 72 (lon) by 36 (lat) by 12 (month)
	meantemp=get.var.ncdf(mn,'tem')   # read mean temp data
	# Read anomaly temp data for 1970-1999:
	if(dsetversion==3){
		anomtemp=get.var.ncdf(an,'temp',start=c(1,1,1,smonth),count=c(72,36,1,mcount))
	}else if(dsetversion==4){
		anomtemp=get.var.ncdf(an,'temperature_anomaly',start=c(1,1,smonth),count=c(72,36,mcount))
	}
	lat=get.var.ncdf(mn,'lat')   # read latitude values
	lon=get.var.ncdf(mn,'lon')   # read longitude values
	# Close observed data netcdf files:
	close.ncdf(mn)
	close.ncdf(an)
	# Reverse latitude order of mean temp for plotting:
	meantemp = meantemp[,length(meantemp[1,,1]):1,]
	# DO NOT reverse for anomaly variable - opposite latitude order
	# Reverse latitude variable order (from mean temp file):
	lat = -lat
	# Initialise temperature array:
	temp = array(data=NA,dim=c(72,36,mcount))
	# Isolate regions to exclude, if requested:
	if(remove_missing){
		missing=missing_data(years,lon,lat,anomtemp,missing_threshold,paste('HadCRUT',dsetversion,sep=''))
		missingmask=missing$mask
	}else{
		missingmask=matrix(TRUE,length(lon),length(lat))
	}
	gdctr=0 # initialise grid cell counter
	for(i in 1:length(lon)){
		for(j in 1:length(lat)){
			if(missingmask[i,j]){ # where there IS enough data
				gdctr = gdctr + 1 # increment grid cell counter
				# Set NA anomaly values to 0:
				for(m in 1:mcount){
					if(is.na(anomtemp[i,j,m])) {anomtemp[i,j,m]=0}
				}
				# Create observed temperature variable:
				for(k in 1:nyears){	
					temp[i,j,((k-1)*12+1):(k*12)] = meantemp[i,j,] + 
						anomtemp[i,j,((k-1)*12+1):(k*12)]
				}
			} # if missing mask
			
		} # lat 
	} # lon
	obs = list(data=temp,lat=lat,lon=lon,missingmask=missingmask,gdctr=gdctr)
	return(obs)
}

GetGPCP = function(dsetversion,years,missing_threshold){
	cat(paste('Loading GPCP version',dsetversion,' - no missing data. \n'))
	library(ncdf4) # load packages
	if(dsetversion==2.2){
		precipfile='~/data/global/GPCP/precip.mon.mean2.2.nc' 
	}else{
		stop('Unknown version of GPCP requested.')	
	}
	# Calculate month count:
	mcount = (years[2]-years[1])*12 + 12
	# Calculate start month
	smonth = (years[1]-1979)*12 + 1
	# Cacluate number of years
	nyears = years[2]-years[1] + 1
	pf=nc_open(precipfile,readunlim=FALSE) # open global mean temp file
	# Meantemp is of dimension 72 (lon) by 36 (lat) by 12 (month)
	precip=ncvar_get(pf,'precip',start=c(1,1,smonth),count=c(144,72,mcount))   # read mean temp data
	lat_orig=ncvar_get(pf,'lat')   # read latitude values
	lon_orig=ncvar_get(pf,'lon')   # read longitude values
	nc_close(pf)
	
	# transform lat and lon (and data to match)
	lat = -lat_orig
	lon = c()
	lon[1:72] = lon_orig[73:144] - 360
	lon[73:144] = lon_orig[1:72]
	p1=array(dim=dim(precip))
	prec=array(dim=dim(precip))
	p1[,1:72,] = precip[,72:1,]
	prec[1:72,,] = p1[73:144,,]
	prec[73:144,,] = p1[1:72,,]
	
	# simply for consistency - no missing data
	missingmask=matrix(TRUE,length(lon),length(lat))
	gdctr = 144*72 # grid cell counter - just for consistency since no missing data here
	obs = list(data=prec,lat=lat,lon=lon,missingmask=missingmask,gdctr=gdctr)
	return(obs)
}

GetGSCD_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'Qs' & variable[['Name']][1] != 'RC' & variable[['Name']][1] != 'BFI') {
    errtext = 'Request for non-Qs, non-RC, non-BFI variable to GetGSCD_Aus read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    var = array(NA,dim=c(416,288,1))  # Initialise data array:
  }else{
    errtext = paste('GetGSCD_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(filelist[[1]]$variable=='Qs'){varname='QMEAN'}else{varname=filelist[[1]]$variable}
  if(interval == 'monthly'){
    var[,,1] = ncvar_get(fid, varname ) # read model output data 
  }	
  # Close netcdf file for this year:
  nc_close(fid)
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  if(varname=='QMEAN'){
    # Change units from mm/year to kg/m2/s
    var = var * 3.16887646e-08
  }
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=var,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}

#########################################################################################


GetGSCD_QMEAN_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'Qs') {
    errtext = 'Request for non-Qs variable to GetGSCD_QMEAN_Aus read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    Qs = array(NA,dim=c(416,288,1))	# Initialise data array:
  }else{
    errtext = paste('GetGSCD_QMEAN_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(interval == 'monthly'){
    Qs[,,1] = ncvar_get(fid, 'QMEAN' ) # read model output data 
  }	
  # Close netcdf file for this year:
  nc_close(fid)
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  # Change units from mm/year to kg/m2/s
  Qs = Qs * 3.16887646e-08
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=Qs,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}

#########################################################################################

GetGSCD_RC_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if(variable[['Name']][1] != 'RC') {
    errtext = 'Request for non-RC variable to GetGSCD_RC_Aus read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    RC = array(NA,dim=c(416,288,1))  # Initialise data array:
  }else{
    errtext = paste('GetGSCD_RC_Aus requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(interval == 'monthly'){
    RC[,,1] = ncvar_get(fid, 'RC' ) # read model output data 
  }	
  # Close netcdf file for this year:
  nc_close(fid)
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  
  nc_close(fid)
  
  timing = list(interval=interval,tsteps=tsteps)
  
  errtext='ok'
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=RC,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}

#########################################################################################

GetGSCD_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'Qs' & variable[['Name']][1] != 'RC' & variable[['Name']][1] != 'BFI')){
    errtext = 'Request for non-Qs, non-RC, non-BFI variable to GetGSCD_Global read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    var = array(NA,dim=c(2880,1440,1))  # Initialise data array: 
  }else{
    errtext = paste('GetGSCD_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(filelist[[1]]$variable=='Qs'){varname='QMEAN'}else{varname=filelist[[1]]$variable}
  if(interval == 'monthly'){
    var[,, 1] = ncvar_get(fid, varname ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
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
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  var_tmp=var
  var_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=var[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  var_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=var[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  var=var_tmp
  
  if(varname=='QS'){
    # Change units from mm/year to kg/m2/s
    var = var * 3.16887646e-08
  }
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=var,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}

#########################################################################################

GetGSCD_QMEAN_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'Qs')){
    errtext = 'Request for non-Qs variable to GetGSCD_QMEAN_Global read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    Qs = array(NA,dim=c(2880,1440,1))	# Initialise data array: 
  }else{
    errtext = paste('GetGSCD_QMEAN_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(interval == 'monthly'){
    Qs[,, 1] = ncvar_get(fid, 'QMEAN' ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
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
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  Qs_tmp=Qs
  Qs_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=Qs[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  Qs_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=Qs[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  Qs=Qs_tmp
  
  # Change units from mm/year to kg/m2/s
  Qs = Qs * 3.16887646e-08
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=Qs,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}

#########################################################################################

GetGSCD_RC_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'RC')){
    errtext = 'Request for non-RC variable to GetGSCD_RC_Global read routine.'
    obs = list(err=TRUE,errtext=errtext)
    return(obs)
  }
  tsteps=1
  # Define number of days in total:
  if((force_interval == 'no') | (force_interval == 'monthly')){
    interval = 'monthly'
    RC = array(NA,dim=c(2880,1440,1))  # Initialise data array: 
  }else{
    errtext = paste('GetGSCD_RC_Global requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  
  # Open file:
  fid = nc_open(filelist[[1]][['path']],write=FALSE,readunlim=FALSE)
  # Read GSCD data for this year:
  if(interval == 'monthly'){
    RC[,, 1] = ncvar_get(fid, 'RC' ) # read model output data
  }	
  # Close netcdf file for this year:
  nc_close(fid)
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
  
  grid$lon <- c(grid$lon[((grid$lonlen/2)+1):grid$lonlen],grid$lon[1:(grid$lonlen/2)]+360) 
  
  RC_tmp=RC
  RC_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=RC[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]
  RC_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=RC[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]
  RC=RC_tmp
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=RC,grid=grid,timing=timing,name='GSCD')
  return(obs)	
}