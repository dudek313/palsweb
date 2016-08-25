# GetGLEAM.R
#
# This script fetches GLEAM ET data
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#


GetGLEAM_Aus = function(variable,filelist,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	# Should really access complete GLEAM data files and pull out Aus,
	# but for now...
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Aus read routine.'
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
		fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
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
	fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
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

################################################################################################################3

GetGLEAM_Aus_05deg = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  # Should really access complete GLEAM data files and pull out Aus,
  # but for now...
  errtext='ok'	
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Aus_05deg read routine.'
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
  yds = Yeardays(min(year),nyears*366)
  daysvector = yds$daysperyear
  ndays = sum(daysvector[1:nyears])
  dayctr = 1 # initialise
  if((force_interval == 'no') | (force_interval == 'daily')){
    interval = 'daily'
    tsteps = ndays
    ET = array(NA,dim=c(104,72,ndays))	# Initialise data array:
  }else if(force_interval == 'monthly'){
    interval = 'monthly'
    tsteps = nyears*12
    ET = array(NA,dim=c(104,72,tsteps))	# Initialise data array:
  }else{
    errtext = paste('GLEAM_Aus_05deg requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
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
  nc_close(fid) # Close netcdf file
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.4 # convert from mm/day to W/m^2
  }
  
  timing = list(interval=interval,tsteps=tsteps)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM ET')
  return(obs)	
}


################################################################################################################3

GetGLEAM_Aus_v2A = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  # Should really access complete GLEAM data files and pull out Aus,
  # but for now...
  errtext='ok'  
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Aus_v2A read routine.'
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
    errtext = paste('GLEAM_Aus_v2A requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read GLEAM data for this year:
    if(interval == 'daily'){
      ET[,,dayctr:(dayctr + daysvector[f] - 1)] = ncvar_get(fid, 'E' ) # read model output data
    }else if(interval == 'monthly'){
      tmp = ncvar_get(fid, 'E' ) # read model output data
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = DailyToMonthly(tmp,year[fileorder[f]],daysvector[f])
    }	
    # Increment counter:
    dayctr = dayctr + daysvector[f]
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
  nc_close(fid) # Close netcdf file
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.4 # convert from mm/day to W/m^2
  }
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM_v2A ET')
  return(obs)	
}

################################################################################################################3

GetGLEAM_Aus_v2B = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  # Should really access complete GLEAM data files and pull out Aus,
  # but for now...
  errtext='ok'  
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Aus_v2B read routine.'
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
    errtext = paste('GLEAM_Aus_v2B requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read GLEAM data for this year:
    if(interval == 'daily'){
      ET[,,dayctr:(dayctr + daysvector[f] - 1)] = ncvar_get(fid, 'E' ) # read model output data
    }else if(interval == 'monthly'){
      tmp = ncvar_get(fid, 'E' ) # read model output data
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = DailyToMonthly(tmp,year[fileorder[f]],daysvector[f])
    }	
    # Increment counter:
    dayctr = dayctr + daysvector[f]
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
  nc_close(fid) # Close netcdf file
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.4 # convert from mm/day to W/m^2
  }
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM_v2B ET')
  return(obs)	
}

################################################################################################################


GetGLEAM_Global = function(variable,filelist,force_interval='no',dsetversion='default'){
	library(ncdf4) # load package
	errtext='ok'	
	if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
		errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Global read routine.'
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
		errtext = paste('GetGLEAM_Global requested to force to unknown interval:',force_interval)
		obs = list(err=TRUE,errtext=errtext)
		return(obs)	
	}
	# Get data:
	for(f in 1:nyears){ # For each file sent by js		
		# Open file:
		fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
		# Read GLEAM data for this year:
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
	
	timing = list(interval=interval,tsteps=tsteps)
	
	# Return result
	obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM ET')
	return(obs)	
}

################################################################################################################

GetGLEAM_Global_v2A = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'	
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Global_v2A read routine.'
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
  yds = Yeardays(min(year),nyears*366)
  daysvector = yds$daysperyear
  ndays = sum(daysvector[1:nyears])
  dayctr = 1 # initialise
  if((force_interval == 'no') | (force_interval == 'daily')){
    interval = 'daily'
    tsteps = ndays
    ET = array(NA,dim=c(1440,720,ndays))	# Initialise data array:
  }else if(force_interval == 'monthly'){
    interval = 'monthly'
    tsteps = nyears*12
    ET = array(NA,dim=c(1440,720,tsteps))	# Initialise data array:
  }else{
    errtext = paste('GLEAM_Global_v2A requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read GLEAM data for this year:
    if(interval == 'daily'){
      ET[,,dayctr:(dayctr + daysvector[f] - 1)] = ncvar_get(fid, 'E' ) # read model output data
    }else if(interval == 'monthly'){
      tmp = ncvar_get(fid, 'E' ) # read model output data
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = DailyToMonthly(tmp,year[fileorder[f]],daysvector[f])
    }	
    # Increment counter:
    dayctr = dayctr + daysvector[f]
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  latitude= ncvar_get(fid, 'latitude' ) 
  longitude= ncvar_get(fid, 'longitude' ) 
  
  # make changes to grid$lon and grid$lat
  latitude=t(kronecker(matrix(1,1,grid$lonlen),latitude[grid$latlen:1])) 
  longitude=c(longitude[((grid$lonlen/2)+1):grid$lonlen],longitude[1:(grid$lonlen/2)]+360) 
  longitude=(kronecker(matrix(1,1,grid$latlen),longitude)) 
  grid$lat<-latitude
  grid$lon<-longitude
  
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  nc_close(fid)
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.4 # convert from mm/day to W/m^2
  }
  
  ET_tmp=ET
  ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
  ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  ET=ET_tmp
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM_v2A ET')
  return(obs)	
}

################################################################################################################

GetGLEAM_Global_v2B = function(variable,filelist,force_interval='no',dsetversion='default'){
  library(ncdf4) # load package
  errtext='ok'  
  if((variable[['Name']][1] != 'Qle') && (variable[['Name']][1] != 'Evap')){
    errtext = 'Request for non-Qle, non-Evap variable to GetGLEAM_Global_v2B read routine.'
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
  yds = Yeardays(min(year),nyears*366)
  daysvector = yds$daysperyear
  ndays = sum(daysvector[1:nyears])
  dayctr = 1 # initialise
  if((force_interval == 'no') | (force_interval == 'daily')){
    interval = 'daily'
    tsteps = ndays
    ET = array(NA,dim=c(1440,472,ndays))	# Initialise data array:
  }else if(force_interval == 'monthly'){
    interval = 'monthly'
    tsteps = nyears*12
    ET = array(NA,dim=c(1440,472,tsteps))	# Initialise data array:
  }else{
    errtext = paste('GLEAM_Global_v2B requested to force to unknown interval:',force_interval)
    obs = list(err=TRUE,errtext=errtext)
    return(obs)	
  }
  # Get data:
  for(f in 1:nyears){ # For each file sent by js		
    # Open file:
    fid = nc_open(filelist[[ fileorder[f] ]][['path']],write=FALSE,readunlim=FALSE)
    # Read GLEAM data for this year:
    if(interval == 'daily'){
      ET[,,dayctr:(dayctr + daysvector[f] - 1)] = ncvar_get(fid, 'E' ) # read model output data
    }else if(interval == 'monthly'){
      tmp = ncvar_get(fid, 'E' ) # read model output data
      ET[,, ((f-1)*12+1) : ((f-1)*12+12)] = DailyToMonthly(tmp,year[fileorder[f]],daysvector[f])
    }	
    # Increment counter:
    dayctr = dayctr + daysvector[f]
    # Close netcdf file for this year:
    nc_close(fid)
  }
  # Reopen first file to fetch lat and lon:
  fid = nc_open(filelist[[ 1 ]][['path']],write=FALSE,readunlim=FALSE)
  # Then get spatial grid structure from first model output file:
  grid = GetGrid(fid)
  latitude= ncvar_get(fid, 'latitude' ) 
  longitude= ncvar_get(fid, 'longitude' ) 
  
  # make changes to grid$lon and grid$lat
  latitude=t(kronecker(matrix(1,1,grid$lonlen),latitude[grid$latlen:1])) 
  longitude=c(longitude[((grid$lonlen/2)+1):grid$lonlen],longitude[1:(grid$lonlen/2)]+360) 
  longitude=(kronecker(matrix(1,1,grid$latlen),longitude)) 
  grid$lat<-latitude
  grid$lon<-longitude
  
  
  if(grid$err){	
    obs = list(err=TRUE,errtext=grid$errtext)
    nc_close(fid) # Close netcdf file
    return(obs)
  }
  nc_close(fid)
  
  if(variable[['Name']][1] == 'Qle'){
    ET = ET*28.4 # convert from mm/day to W/m^2
  }
  
  ET_tmp=ET
  ET_tmp[1:(grid$lonlen/2),1:grid$latlen,1:tsteps]=ET[((grid$lonlen/2)+1):grid$lonlen,grid$latlen:1,1:tsteps]
  ET_tmp[((grid$lonlen/2)+1):grid$lonlen,1:grid$latlen,1:tsteps]=ET[1:(grid$lonlen/2),grid$latlen:1,1:tsteps]
  ET=ET_tmp
  
  timing = list(interval=interval,tsteps=tsteps,syear=year)
  
  # Return result
  obs = list(err=FALSE,errtext=errtext,data=ET,grid=grid,timing=timing,name='GLEAM_v2B ET')
  return(obs)	
}
