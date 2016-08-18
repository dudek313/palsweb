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