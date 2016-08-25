# 2DMetrics.R
#
# Gab Abramowitz, UNSW, 2015, gabsun at gmail dot com
#

TimeMeanAll = function(model,obs,bench,variable,plottype,mask,cl,region,QAexist=FALSE){
  # Calculates time means for each grid point in obs, model and benchmark data  
  metrics = list()
  benchm = list()
  benchbias = list()
  
  # Categorize QA data
  if(QAexist==FALSE){catdata=array(1,dim(mask))}else{catdata=CategorizeQAData(obs,2,20)}
  
  # Calculate time means for plotting:
  modelm = list(TimeMean(model$data,cl) * mask, TimeMean(model$data,cl) * mask * catdata)
  obsm = list(TimeMean(obs$data,cl) * mask, TimeMean(obs$data,cl) * mask * catdata)
  # Ranges of obs, model metric values (benchmarks only appear in difference plots):
  zrange = c(min(modelm[[1]],obsm[[1]],na.rm=TRUE),max(modelm[[1]],obsm[[1]],na.rm=TRUE))
  # Scalar metric for reporting:
  modelbias = list(mean(modelm[[1]]-obsm[[1]],na.rm=TRUE), mean(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  # Initial ranges for difference plots:
  dmax = list(max(modelm[[1]]-obsm[[1]],na.rm=TRUE), max(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  dmin = list(min(modelm[[1]]-obsm[[1]],na.rm=TRUE), min(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  if(bench$exist){
    for(b in 1:bench$howmany){
      # Get benchmark metric data, noting there may have been other benchmarks 
      # that failed (so use bench$index)
      benchm[[b]] = list(TimeMean(bench[[ bench$index[b] ]]$data,cl) * mask, TimeMean(bench[[ bench$index[b] ]]$data,cl) * mask * catdata)
      benchbias[[b]] = list(mean(benchm[[b]][[1]]-obsm[[1]],na.rm=TRUE), mean(benchm[[b]][[2]]-obsm[[2]],na.rm=TRUE))
      dmax = list(max(dmax[[1]],(benchm[[b]][[1]]-obsm[[1]]),na.rm=TRUE), max(dmax[[2]],(benchm[[b]][[2]]-obsm[[2]]),na.rm=TRUE))
      dmin = list(min(dmin[[1]],(benchm[[b]][[1]]-obsm[[1]]),na.rm=TRUE), min(dmin[[2]],(benchm[[b]][[2]]-obsm[[2]]),na.rm=TRUE)) 
      benchm[[b]] = benchm[[b]][[-2]]
    }
  }
  
  diffrange = c(dmin[[1]], dmax[[1]])
  
  if(QAexist==FALSE){
      metrics[[1]] = list(name='TimeSpaceBias',model_value=modelbias[[1]],bench_value=ifelse(bench$exist,benchbias[[1]],benchbias)) 
  }else{
    metrics[[1]] = list(name='TimeSpaceBias',model_value=modelbias,bench_value=benchbias)  
  }
  
  result = list(modelm = modelm[[1]], obsm=obsm[[1]], benchm=benchm, diffrange = diffrange, 
                zrange=zrange,metrics=metrics) # benchm[[1]]
  
  return(result)
}

# TimeMeanAll = function(model,obs,bench,variable,plottype,mask,cl,region){
#   # Calculates time means for each grid point in obs, model and benchmark data  
#   metrics = list()
#   benchm = list()
#   benchbias = c()
#   
#   # Calculate time means for plotting:
#   modelm = TimeMean(model$data,cl) * mask
#   obsm = TimeMean(obs$data,cl) * mask
#   # Ranges of obs, model metric values (benchmarks only appear in difference plots):
#   zrange = c(min(modelm,obsm,na.rm=TRUE),max(modelm,obsm,na.rm=TRUE))
#   # Scalar metric for reporting:
#   modelbias = mean(modelm-obsm,na.rm=TRUE)
#   # Initial ranges for difference plots:
#   dmax = max(modelm-obsm,na.rm=TRUE)
#   dmin = min(modelm-obsm,na.rm=TRUE)
#   maxbias = 0
#   indmax = 0
#   if(bench$exist){
#     for(b in 1:bench$howmany){
#       # Get benchmark metric data, noting there may have been other benchmarks 
#       # that failed (so use bench$index)
#       benchm[[b]] = TimeMean(bench[[ bench$index[b] ]]$data,cl) * mask
#       benchbias[b] = mean(benchm[[b]]-obsm,na.rm=TRUE)
#       dmax = max(dmax,(benchm[[b]]-obsm),na.rm=TRUE)
#       dmin = min(dmin,(benchm[[b]]-obsm),na.rm=TRUE)     
#       if(max(benchm[[b]]-obsm,na.rm=TRUE) > maxbias){
#         maxbias = max(benchm[[b]]-obsm,na.rm=TRUE)
#         indmax = b
#       }
#     }
#   }
#   
#   diffrange = c(dmin, dmax)
#   metrics[[1]] = list(name='TimeSpaceBias',model_value=modelbias,bench_value=benchbias)	
#   result = list(modelm = modelm, obsm=obsm, benchm=benchm, diffrange = diffrange, 
#                 zrange=zrange,metrics=metrics)
#   return(result)
# }

TimeSDAll = function(model,obs,bench,variable,plottype,mask,cl,region,QAexist=FALSE){
  # Categorize QA data
  if(QAexist==FALSE){catdata=array(1,dim(mask))}else{catdata=CategorizeQAData(obs,2,20)}
  
  # Calculates standard deviation for each grid point in obs, model and benchmark data
  metrics = list()
  benchm = list()
  benchSDbias = list()
  # Calculate time means:
  modelm = list(TimeSD(model$data,cl) * mask, TimeSD(model$data,cl) * mask * catdata)
  obsm = list(TimeSD(obs$data,cl) * mask, TimeSD(obs$data,cl) * mask * catdata) 
  # Ranges of obs, model metric values (benchmarks only appear in difference plots):
  zrange = c(min(modelm[[1]],obsm[[1]],na.rm=TRUE),max(modelm[[1]],obsm[[1]],na.rm=TRUE))
  # Scalar metric for reporting:
  modelSDbias = list(mean(modelm[[1]]-obsm[[1]],na.rm=TRUE),mean(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  # Initial ranges for difference plots:
  dmax = list(max(modelm[[1]]-obsm[[1]],na.rm=TRUE),max(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  dmin = list(min(modelm[[1]]-obsm[[1]],na.rm=TRUE),min(modelm[[2]]-obsm[[2]],na.rm=TRUE))
  if(bench$exist){
    for(b in 1:bench$howmany){
      # Get benchmark metric data, noting there may have been other benchmarks 
      # that failed (so use bench$index)
      benchm[[b]] = list(TimeSD(bench[[ bench$index[b] ]]$data,cl) * mask, TimeSD(bench[[ bench$index[b] ]]$data,cl) * mask * catdata)
      benchSDbias[[b]] = list(mean(benchm[[b]][[1]]-obsm[[1]],na.rm=TRUE), mean(benchm[[b]][[2]]-obsm[[2]],na.rm=TRUE))
      dmax = list(max(dmax[[1]],(benchm[[b]][[1]]-obsm[[1]]),na.rm=TRUE), max(dmax[[2]],(benchm[[b]][[2]]-obsm[[2]]),na.rm=TRUE))
      dmin = list(min(dmin[[1]],(benchm[[b]][[1]]-obsm[[1]]),na.rm=TRUE), min(dmin[[2]],(benchm[[b]][[2]]-obsm[[2]]),na.rm=TRUE))
      benchm[[b]] = benchm[[b]][[-2]]
    }
  }
  diffrange = c(dmin[[1]], dmax[[1]])
  
  if(QAexist==FALSE){
    metrics[[1]] = list(name='AvTimeSDbias',model_value=modelSDbias[[1]],bench_value=ifelse(bench$exist,benchSDbias[[1]],benchSDbias))  
  }else{
    metrics[[1]] = list(name='AvTimeSDbias',model_value=modelSDbias,bench_value=benchSDbias)  
  }
  
  result = list(modelm = modelm[[1]], obsm=obsm[[1]], benchm=benchm, diffrange = diffrange, 
                zrange=zrange,metrics=metrics) #benchm[[1]]
  
  return(result)
}

# TimeSDAll = function(model,obs,bench,variable,plottype,mask,cl,region){
#   # Calculates standard deviation for each grid point in obs, model and benchmark data
#   metrics = list()
#   benchm = list()
#   benchSDbias = c()
#   # Calculate time means:
#   modelm = TimeSD(model$data,cl) * mask
#   obsm = TimeSD(obs$data,cl) * mask 
#   # Ranges of obs, model metric values (benchmarks only appear in difference plots):
#   ##if(region=="Global"){
#     zrange = c(min(modelm,obsm,na.rm=TRUE),max(modelm,obsm,na.rm=TRUE))
#   ##}else if(region=="Australia"){
#   ##  zrange = FindExtremeThreshold(data1=modelm,data2=obsm)
#   ##}
#   # Scalar metric for reporting:
#   modelSDbias = mean(modelm-obsm,na.rm=TRUE)
#   # Initial ranges for difference plots:
#   dmax = max(modelm-obsm,na.rm=TRUE)
#   dmin = min(modelm-obsm,na.rm=TRUE)
#   maxbias = 0
#   indmax = 0
#   if(bench$exist){
#     for(b in 1:bench$howmany){
#       # Get benchmark metric data, noting there may have been other benchmarks 
#       # that failed (so use bench$index)
#       benchm[[b]] = TimeSD(bench[[ bench$index[b] ]]$data,cl) * mask
#       benchSDbias[b] = mean(benchm[[b]]-obsm,na.rm=TRUE)
#       dmax = max(dmax,(benchm[[b]]-obsm),na.rm=TRUE)
#       dmin = min(dmin,(benchm[[b]]-obsm),na.rm=TRUE)
#       if(max(benchm[[b]]-obsm,na.rm=TRUE) > maxbias){
#         maxbias = max(benchm[[b]]-obsm,na.rm=TRUE)
#         indmax = b
#       }
#     }
#   }
#   ##if(region=="Global"){
#     diffrange = c(dmin, dmax)
#   ##}else if(region=="Australia"){
#   ##  diffrange = FindExtremeThreshold(data1=(modelm-obsm),data2=(benchm[[indmax]]-obsm))
#   ##}
#   metrics[[1]] = list(name='AvTimeSDbias',model_value=modelSDbias,bench_value=benchSDbias)	
#   result = list(modelm = modelm, obsm=obsm, benchm=benchm, diffrange = diffrange, 
#                 zrange=zrange,metrics=metrics)
#   return(result)
# }

TimeRMSEAll = function(model,obs,bench,variable,plottype,mask,cl,region,QAexist=FALSE){
  # Calculates root mean square error for each grid point for model and benchmark data
  metrics = list()
  benchm = list()
  benchRMSE = list()
  # Categorize QA data
  if(QAexist==FALSE){catdata=array(1,dim(mask))}else{catdata=CategorizeQAData(obs,2,20)}
  suppressunits = FALSE # i.e. RMSE has units - unlike, e.g. correlation
  # Calculate time RMSE for plotting:
  modelm = list(TimeRMSE(obs$data, model$data,cl) * mask, TimeRMSE(obs$data, model$data,cl) * mask * catdata)
  modelRMSE = list(sqrt(mean(((model$data - obs$data) * replicate(obs$timing$tsteps,mask))^2,na.rm=TRUE)), sqrt(mean(((model$data - obs$data) * replicate(obs$timing$tsteps,mask * catdata))^2,na.rm=TRUE))) # scalar reporting metric
  # Initial ranges:
  rmax = list(max(modelm[[1]],na.rm=TRUE), max(modelm[[2]],na.rm=TRUE))
  rmin = list(min(modelm[[1]],na.rm=TRUE), max(modelm[[2]],na.rm=TRUE))
  if(bench$exist){
    for(b in 1:bench$howmany){
      # Get benchmark metric data, noting there may have been other benchmarks 
      # that failed (so use bench$index)
      benchm[[b]] = list(TimeRMSE(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask, TimeRMSE(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask * catdata)
      benchRMSE[[b]] = list(sqrt(mean(((bench[[ bench$index[b] ]]$data - obs$data) * replicate(obs$timing$tsteps,mask))^2,na.rm=TRUE)), sqrt(mean(((bench[[ bench$index[b] ]]$data - obs$data) * replicate(obs$timing$tsteps,mask* catdata))^2,na.rm=TRUE)))
      rmax = list(max(rmax[[1]],benchm[[b]][[1]],na.rm=TRUE), max(rmax[[2]],benchm[[b]][[2]],na.rm=TRUE))
      rmin = list(min(rmin[[1]],benchm[[b]][[1]],na.rm=TRUE), min(rmin[[2]],benchm[[b]][[2]],na.rm=TRUE))
      benchm[[b]] = benchm[[b]][[-2]]
    }
  }
  zrange = c(rmin[[1]], rmax[[1]])
  
  if(QAexist==FALSE){
    metrics[[1]] = list(name='TimeSpaceRMSE',model_value=modelRMSE[[1]],bench_value=ifelse(bench$exist,benchRMSE[[1]],benchRMSE))  
  }else{
    metrics[[1]] = list(name='TimeSpaceRMSE',model_value=modelRMSE,bench_value=benchRMSE)  
  }
  
  result = list(modelm = modelm[[1]], benchm=benchm, zrange = zrange , 
                metrics=metrics, suppressunits = suppressunits) #benchm[[1]]
  return(result)
}

# 
# TimeRMSEAll = function(model,obs,bench,variable,plottype,mask,cl,region){
#   # Calculates root mean square error for each grid point for model and benchmark data
#   metrics = list()
#   benchm = list()
#   benchRMSE = c()
#   suppressunits = FALSE # i.e. RMSE has units - unlike, e.g. correlation
#   # Calculate time RMSE for plotting:
#   modelm = TimeRMSE(obs$data, model$data,cl) * mask
#   modelRMSE = sqrt(mean((model$data - obs$data)^2,na.rm=TRUE)) # scalar reporting metric
#   # Initial ranges:
#   rmax = max(modelm,na.rm=TRUE)
#   rmin = min(modelm,na.rm=TRUE)
#   maxbias = 0
#   indmax = 0
#   if(bench$exist){
#     for(b in 1:bench$howmany){
#       # Get benchmark metric data, noting there may have been other benchmarks 
#       # that failed (so use bench$index)
#       benchm[[b]] = TimeRMSE(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask
#       benchRMSE[b] = sqrt(mean((bench[[ bench$index[b] ]]$data - obs$data)^2,na.rm=TRUE))
#       rmax = max(rmax,benchm[[b]],na.rm=TRUE)
#       rmin = min(rmin,benchm[[b]],na.rm=TRUE)
#       if(max(benchm[[b]],na.rm=TRUE) > maxbias){
#         maxbias = max(benchm[[b]],na.rm=TRUE)
#         indmax = b
#       }
#     }
#   }
#   ##if(region=="Global"){
#     zrange = c(rmin, rmax)
#   ##}else if(region=="Australia"){
#   ##  zrange = FindExtremeThreshold(data1=modelm,data2=benchm[[indmax]])
#   ##}
#   metrics[[1]] = list(name='TimeSpaceRMSE',model_value=modelRMSE,bench_value=benchRMSE)	
#   result = list(modelm = modelm, benchm=benchm, zrange = zrange , 
#                 metrics=metrics, suppressunits = suppressunits)
#   return(result)
# }

TimeCorAll = function(model,obs,bench,variable,plottype,mask,cl,region,QAexist=FALSE){
  # Calculates correlation for each grid point for model,obs and benchmark,obs data
  metrics = list()  
  benchm = list()
  benchAvTimeCor = list()
  benchTimeSpaceCor = list()
  # Categorize QA data
  if(QAexist==FALSE){catdata=array(1,dim(mask))}else{catdata=CategorizeQAData(obs,2,20)}
  suppressunits = TRUE # i.e. correlation has no units
  # Calculate time correlation for plotting:
  modelm = list(TimeCor(obs$data, model$data,cl) * mask, TimeCor(obs$data, model$data,cl) * mask * catdata)
  # Two scalar metrics:
  modelAvTimeCor = list(mean(modelm[[1]],na.rm=TRUE), mean(modelm[[2]],na.rm=TRUE)) # Average of time correlation
  modelTimeSpaceCor = list(cor(as.vector(obs$data*replicate(obs$timing$tsteps,mask)),as.vector(model$data*replicate(model$timing$tsteps,mask))), cor(as.vector(obs$data*replicate(obs$timing$tsteps,mask*catdata)),as.vector(model$data*replicate(model$timing$tsteps,mask*catdata)))) # Cor over time and space
  # initial ranges:
  rmax = list(max(modelm[[1]],na.rm=TRUE), max(modelm[[2]],na.rm=TRUE))
  rmin = list(min(modelm[[1]],na.rm=TRUE), min(modelm[[2]],na.rm=TRUE))
  if(bench$exist){
    for(b in 1:bench$howmany){
      # Get benchmark metric data, noting there may have been other benchmarks 
      # that failed (so use bench$index)
      benchm[[b]] = list(TimeCor(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask, TimeCor(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask *catdata) 
      benchAvTimeCor[[b]] = list(mean(benchm[[b]][[1]],na.rm=TRUE), mean(benchm[[b]][[2]],na.rm=TRUE))
      benchTimeSpaceCor[[b]] = list(cor(as.vector(obs$data * replicate(obs$timing$tsteps,mask)),as.vector(bench[[ bench$index[b] ]]$data * replicate(obs$timing$tsteps,mask))),
                                    cor(as.vector(obs$data * replicate(obs$timing$tsteps,mask*catdata)),as.vector(bench[[ bench$index[b] ]]$data * replicate(obs$timing$tsteps,mask*catdata))))
                                    rmax = list(max(rmax[[1]],benchm[[b]][[1]],na.rm=TRUE), max(rmax[[2]],benchm[[b]][[2]],na.rm=TRUE))
                                    rmin = list(min(rmin[[1]],benchm[[b]][[1]],na.rm=TRUE), min(rmin[[2]],benchm[[b]][[2]],na.rm=TRUE))
      benchm[[b]] = benchm[[b]][[-2]]
    }
  }
  zrange = c(rmin[[1]], rmax[[1]])
  if(QAexist==FALSE){
    metrics[[1]] = list(name='AvTimeCor',model_value=modelAvTimeCor[[1]],bench_value=ifelse(bench$exist,benchAvTimeCor[[1]],benchAvTimeCor)) 
    metrics[[2]] = list(name='TimeSpaceCor',model_value=modelTimeSpaceCor[[1]],bench_value=ifelse(bench$exist,benchTimeSpaceCor[[1]],benchTimeSpaceCor))
  }else{
    metrics[[1]] = list(name='AvTimeCor',model_value=unlist(modelAvTimeCor),bench_value=unlist(benchAvTimeCor))
    metrics[[2]] = list(name='TimeSpaceCor',model_value=unlist(modelTimeSpaceCor),bench_value=unlist(benchTimeSpaceCor))  
  }
  result = list(modelm = modelm[[1]], benchm=benchm, zrange = zrange, 
                metrics=metrics, suppressunits = suppressunits) # benchm[[1]]
  return(result)
}

# TimeCorAll = function(model,obs,bench,variable,plottype,mask,cl,region){
#   # Calculates correlation for each grid point for model,obs and benchmark,obs data
#   metrics = list()  
#   benchm = list()
#   benchAvTimeCor = c()
#   benchTimeSpaceCor = c()
#   suppressunits = TRUE # i.e. correlation has no units
#   # Calculate time correlation for plotting:
#   modelm = TimeCor(obs$data, model$data,cl) * mask
#   # Two scalar metrics:
#   modelAvTimeCor = mean(modelm,na.rm=TRUE) # Average of time correlation
#   modelTimeSpaceCor = cor(as.vector(obs$data),as.vector(model$data)) # Cor over time and space
#   # initial ranges:
#   rmax = max(modelm,na.rm=TRUE)
#   rmin = min(modelm,na.rm=TRUE)
#   maxbias = 0
#   indmax = 0
#   if(bench$exist){
#     for(b in 1:bench$howmany){
#       # Get benchmark metric data, noting there may have been other benchmarks 
#       # that failed (so use bench$index)
#       benchm[[b]] = TimeCor(obs$data, bench[[ bench$index[b] ]]$data,cl) * mask
#       benchAvTimeCor[b] = mean(benchm[[b]],na.rm=TRUE)
#       benchTimeSpaceCor[b] = cor(as.vector(obs$data),as.vector(bench[[ bench$index[b] ]]$data))
#       rmax = max(rmax,benchm[[b]],na.rm=TRUE)
#       rmin = min(rmin,benchm[[b]],na.rm=TRUE)
#       if(max(benchm[[b]],na.rm=TRUE) > maxbias){
#         maxbias = max(benchm[[b]],na.rm=TRUE)
#         indmax = b
#       }
#     }
#   }
#   ##if(region=="Global"){
#   zrange = c(rmin, rmax)
#   ##}else if(region=="Australia"){
#   ##  zrange = FindExtremeThreshold(data1=modelm,data2=benchm[[indmax]])
#   ##}
#   metrics[[1]] = list(name='AvTimeCor',model_value=modelAvTimeCor,bench_value=benchAvTimeCor)
#   metrics[[2]] = list(name='TimeSpaceCor',model_value=modelTimeSpaceCor,bench_value=benchTimeSpaceCor)
#   result = list(modelm = modelm, benchm=benchm, zrange = zrange, 
#                 metrics=metrics, suppressunits = suppressunits)
#   return(result)
# }

TimeMean = function(threedvar,cl){
  # Take the time mean of 3D variable
  if(is.null(cl)){
    twodvar = apply(threedvar,c(1,2),mean)	
  }else{
    twodvar = parApply(cl,threedvar,c(1,2),mean)
  }
  return(twodvar)
}

TimeSD = function(threedvar, cl){
  # Take the time sd of 3D variable
  if(is.null(cl)){
    twodvar = apply(threedvar,c(1,2),sd)
  }else{
    twodvar = parApply(cl,threedvar,c(1,2),sd)	
  }
  return(twodvar)
}

TimeRMSE = function(obs3d,model3d,cl){
  if(is.null(cl)){
    twodvar = apply((model3d - obs3d),c(1,2),rootmeansquare)
  }else{
    twodvar = parApply(cl,(model3d - obs3d),c(1,2),rootmeansquare)
  }
  return(twodvar)
}

rootmeansquare = function(diffvector){
  result = sqrt(mean(diffvector^2))
  return(result)
}

TimeCor = function(obs3d,model3d,cl){
  spacedim = dim(obs3d[,,1])
  indx = array(NA,dim=c(spacedim,2))
  indx[,,1] = matrix(1:spacedim[1],nrow=spacedim[1],ncol=spacedim[2])
  indx[,,2] = matrix(1:spacedim[2],nrow=spacedim[1],ncol=spacedim[2],byrow=TRUE)
  if(is.null(cl)){
    twodcor = apply(indx,c(1,2),ApplyCor,obs3d,model3d)
  }else{
    twodcor = parApply(cl,indx,c(1,2),ApplyCor,obs3d,model3d)
  }
  return(twodcor)
}

ApplyCor = function(index,obs3d,model3d){
  scalarcor = cor(obs3d[index[1],index[2],],model3d[index[1],index[2],])
}


FindCommonRange = function(metrics_data){
  diffmin = zmin = Inf
  diffmax = zmax = -Inf 
  for(i in 1:length(metrics_data)){
    diffmin = min(diffmin,metrics_data[[i]]$diffrange[[1]])
    diffmax = max(diffmax,metrics_data[[i]]$diffrange[[2]])
    zmin = min(zmin,metrics_data[[i]]$zrange[[1]])
    zmax = max(zmax,metrics_data[[i]]$zrange[[2]])
  }
  diffrange = c(diffmin,diffmax)
  zrange = c(zmin, zmax) 
  modified_metrics_data = list()
  for(i in 1:length(metrics_data)){
    modified_metrics_data[[i]] = metrics_data[[i]]
    modified_metrics_data[[i]]$diffrange = diffrange
    modified_metrics_data[[i]]$zrange = zrange
  }
  return(modified_metrics_data)
}

