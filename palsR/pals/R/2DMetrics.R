# 2DMetrics.R
#
# Gab Abramowitz, UNSW, 2016, gabsun at gmail dot com
#
absoluteMetric = c('TimeMean','TimeSD')
relativeMetric = c('TimeRMSE','TimeCor')

SinglePlotValues = function(Analysis,mask,region,plotdata,cluster){
	# Calculate values to plot, as well as metrics, for a single analysis
	metrics = list()
	# Number of comparables - e.g. just DS (=1)? DS and bench (=2)?
	comparables = length(plotdata)
	######### TIME MEAN ############
	if(Analysis$type == 'TimeMean'){
		if(comparables == 1){
			plotvalues = TimeMean(plotdata[[1]],cluster) * mask
			metrics[[1]] = list(name='TimeSpaceMean',value=mean(plotvalues,na.rm=TRUE))
		}else if(comparables == 2){
			pv = lapply(plotdata,TimeMean,cluster)
			# ASSUME two comparables is a request for the difference between them
			plotvalues = ( pv[[2]] - pv[[1]] ) * mask
			metrics[[1]] = list(name='TimeSpaceBias',value=mean(plotvalues,na.rm=TRUE))
		}else{
			result = list(plotvalues=NA, plotden=NA, metrics=list(NA),err=TRUE,
				errtext='Request to apply TimeMean to 3 products...')
			return(result)
		}
	############ TIME SD ##############
	}else if(Analysis$type == 'TimeSD'){
		if(comparables == 1){
			plotvalues = TimeSD(plotdata[[1]],cluster) * mask
			metrics[[1]] = list(name='TimeSDMean',value=mean(plotvalues,na.rm=TRUE))
		}else if(comparables == 2){
			pv = lapply(plotdata,TimeSD,cluster)
			# ASSUME two comparables is a request for the difference between them
			plotvalues = ( pv[[2]] - pv[[1]] ) * mask
			metrics[[1]] = list(name='TimeSDBias',value=mean(plotvalues,na.rm=TRUE))
		}else{
			result = list(plotvalues=NA, plotden=NA, metrics=list(NA),err=TRUE,
				errtext='Request to apply TimeSD to 3 products...')
			return(result)
		}
	############# TIME RMSE ##############
	}else if(Analysis$type == 'TimeRMSE'){
		if(comparables == 2){
			plotvalues = TimeRMSE(plotdata[[1]],plotdata[[2]],cluster) * mask
			metrics[[1]] = list(name='TimeSpaceRMSE',value=mean(plotvalues,na.rm=TRUE))
		}else if(comparables == 3){
			# ASSUME 3 comparables is a request for the difference between 
			# 1-2RMSE and 1-3RMSE:
			pv1 = TimeRMSE(plotdata[[1]],plotdata[[2]],cluster)
			pv2 = TimeRMSE(plotdata[[1]],plotdata[[3]],cluster)
			plotvalues = ( pv1 - pv2 ) * mask
			metrics[[1]] = list(name='MeanTimeRMSEdiff',value=mean(plotvalues,na.rm=TRUE))
		}else{
			result = list(plotvalues=NA, plotden=NA, metrics=list(NA),err=TRUE,
				errtext='Request to apply TimeRMSE to 1 or >3 products...')
			return(result)
		}
	############# TIME Cor ##############
	}else if(Analysis$type == 'TimeCor'){
		if(comparables == 2){
			plotvalues = TimeCor(plotdata[[1]],plotdata[[2]],cluster) * mask
			TimeSpaceCor = cor(as.vector(plotdata[[1]]),as.vector(plotdata[[2]]))
			metrics[[1]] = list(name='TimeSpaceCor',value=TimeSpaceCor)
			metrics[[2]] = list(name='MeanTimeCor',value=mean(plotvalues,na.rm=TRUE))
		}else if(comparables == 3){
			# ASSUME 3 comparables is a request for the difference between 
			# 1-2RMSE and 1-3RMSE:
			pv1 = TimeCor(plotdata[[1]],plotdata[[2]],cluster)
			pv2 = TimeCor(plotdata[[1]],plotdata[[3]],cluster)
			plotvalues = ( pv1 - pv2 ) * mask
			metrics[[1]] = list(name='MeanTimeCorDiff',value=mean(plotvalues,na.rm=TRUE))
		}else{
			result = list(plotvalues=NA, plotden=NA, metrics=list(NA),err=TRUE,
				errtext='Request to apply TimeCor to 1 or >3 products...')
			return(result)
		}
	}
	plotden = density(plotvalues,na.rm=TRUE)
	plotmean = mean(plotvalues,na.rm=TRUE)
	plotsd = sd(plotvalues,na.rm=TRUE)
	result = list(plotvalues=plotvalues,plotden=plotden,plotmean=plotmean,plotsd=plotsd,
		metrics=metrics,err=FALSE,errtext='ok')
	return(result)
}

TimeMeanAll = function(model,obs,bench,variable,plottype,cl){
	# Calculates time means for each grid point in obs, model and benchmark data  
	metrics = list()
	benchm = list()
	benchbias = c()
	# Calculate time means for plotting:
	modelm = TimeMean(model$data,cl)
	obsm = TimeMean(obs$data,cl) + modelm - modelm # to make sure ocean areas not included
	# Ranges of obs, model metric values (benchmarks only appear in difference plots):
	zrange = c(min(modelm,obsm,na.rm=TRUE),max(modelm,obsm,na.rm=TRUE))
	# Scalar metric for reporting:
	modelbias = mean(modelm-obsm,na.rm=TRUE)
	# Initial ranges for difference plots:
	dmax = max(modelm-obsm,na.rm=TRUE)
	dmin = min(modelm-obsm,na.rm=TRUE)
	if(bench$exist){
		for(b in 1:bench$howmany){
			# Get benchmark metric data, noting there may have been other benchmarks 
			# that failed (so use bench$index)
			benchm[[b]] = TimeMean(bench[[ bench$index[b] ]]$data,cl)
			benchbias[b] = mean(benchm[[b]]-obsm,na.rm=TRUE)
			dmax = max(dmax,(benchm[[b]]-obsm),na.rm=TRUE)
			dmin = min(dmin,(benchm[[b]]-obsm),na.rm=TRUE)
		}
	}
	metrics[[1]] = list(name='TimeSpaceBias',model_value=modelbias,bench_value=benchbias)	
	result = list(modelm = modelm, obsm=obsm, benchm=benchm, diffrange = c(dmin, dmax), 
		zrange=zrange,metrics=metrics)
	return(result)
}

TimeSDAll = function(model,obs,bench,variable,plottype,cl){
	# Calculates standard deviation for each grid point in obs, model and benchmark data
	metrics = list()
	benchm = list()
	benchSDbias = c()
	# Calculate time means:
	modelm = TimeSD(model$data,cl)
	obsm = TimeSD(obs$data,cl) + modelm - modelm # to make sure ocean areas not included
	# Ranges of obs, model metric values (benchmarks only appear in difference plots):
	zrange = c(min(modelm,obsm,na.rm=TRUE),max(modelm,obsm,na.rm=TRUE))
	# Scalar metric for reporting:
	modelSDbias = mean(modelm-obsm,na.rm=TRUE)
	# Initial ranges for difference plots:
	dmax = max(modelm-obsm,na.rm=TRUE)
	dmin = min(modelm-obsm,na.rm=TRUE)
	if(bench$exist){
		for(b in 1:bench$howmany){
			# Get benchmark metric data, noting there may have been other benchmarks 
			# that failed (so use bench$index)
			benchm[[b]] = TimeSD(bench[[ bench$index[b] ]]$data,cl)
			benchSDbias[b] = mean(benchm[[b]]-obsm,na.rm=TRUE)
			dmax = max(dmax,(benchm[[b]]-obsm),na.rm=TRUE)
			dmin = min(dmin,(benchm[[b]]-obsm),na.rm=TRUE)
		}
	}
	metrics[[1]] = list(name='AvTimeSDbias',model_value=modelSDbias,bench_value=benchSDbias)	
	result = list(modelm = modelm, obsm=obsm, benchm=benchm, diffrange = c(dmin, dmax), 
		zrange=zrange,metrics=metrics)
	return(result)
}

TimeRMSEAll = function(model,obs,bench,variable,plottype,cl){
	# Calculates root mean square error for each grid point for model and benchmark data
	metrics = list()
	benchm = list()
	benchRMSE = c()
	suppressunits = FALSE # i.e. RMSE has units - unlike, e.g. correlation
	# Calculate time RMSE for plotting:
	modelm = TimeRMSE(obs$data, model$data,cl)
	modelRMSE = sqrt(mean((model$data - obs$data)^2,na.rm=TRUE)) # scalar reporting metric
	# Initial ranges:
	rmax = max(modelm,na.rm=TRUE)
	rmin = min(modelm,na.rm=TRUE)
	if(bench$exist){
		for(b in 1:bench$howmany){
			# Get benchmark metric data, noting there may have been other benchmarks 
			# that failed (so use bench$index)
			benchm[[b]] = TimeRMSE(obs$data, bench[[ bench$index[b] ]]$data,cl)
			benchRMSE[b] = sqrt(mean((bench[[ bench$index[b] ]]$data - obs$data)^2,na.rm=TRUE))
			rmax = max(rmax,benchm[[b]],na.rm=TRUE)
			rmin = min(rmin,benchm[[b]],na.rm=TRUE)
		}
	}
	metrics[[1]] = list(name='TimeSpaceRMSE',model_value=modelRMSE,bench_value=benchRMSE)	
	result = list(modelm = modelm, benchm=benchm, zrange = c(rmin, rmax), 
		metrics=metrics, suppressunits = suppressunits)
	return(result)
}

TimeCorAll = function(model,obs,bench,variable,plottype,cl){
	# Calculates correlation for each grid point for model,obs and benchmark,obs data
	metrics = list()  
	benchm = list()
	benchAvTimeCor = c()
	benchTimeSpaceCor = c()
	suppressunits = TRUE # i.e. correlation has no units
	# Calculate time correlation for plotting:
	modelm = TimeCor(obs$data, model$data,cl)
	# Two scalar metrics:
	modelAvTimeCor = mean(modelm,na.rm=TRUE) # Average of time correlation
	modelTimeSpaceCor = cor(as.vector(obs$data),as.vector(model$data)) # Cor over time and space
	# initial ranges:
	rmax = max(modelm,na.rm=TRUE)
	rmin = min(modelm,na.rm=TRUE)
	if(bench$exist){
		for(b in 1:bench$howmany){
			# Get benchmark metric data, noting there may have been other benchmarks 
			# that failed (so use bench$index)
			benchm[[b]] = TimeCor(obs$data, bench[[ bench$index[b] ]]$data,cl)
			benchAvTimeCor[b] = mean(benchm[[b]],na.rm=TRUE)
			benchTimeSpaceCor[b] = cor(as.vector(obs$data),as.vector(bench[[ bench$index[b] ]]$data))
			rmax = max(rmax,benchm[[b]],na.rm=TRUE)
			rmin = min(rmin,benchm[[b]],na.rm=TRUE)
		}
	}
	metrics[[1]] = list(name='AvTimeCor',model_value=modelAvTimeCor,bench_value=benchAvTimeCor)
	metrics[[2]] = list(name='TimeSpaceCor',model_value=modelTimeSpaceCor,bench_value=benchTimeSpaceCor)
	result = list(modelm = modelm, benchm=benchm, zrange = c(rmin, rmax), 
		metrics=metrics, suppressunits = suppressunits)
	return(result)
}

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
