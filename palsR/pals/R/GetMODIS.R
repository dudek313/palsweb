# GetMODIS.R
#
# This script fetches MPI ET data
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#

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