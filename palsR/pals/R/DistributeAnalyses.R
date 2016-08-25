# DistributeAnalyses.R
#
# Functions to distribute analyses across multiple cores
#
# Gab Abramowitz, UNSW, 2015 (palshelp at gmail dot com)


DistributeGriddedAnalyses = function(Analysis,vars,obs,model,bench,region,type,cl){
  # Each call to this function will generate a single plot and a list of metrics associate with it
  
  # Create outfilename:
  if(type!="MultiObsMap"){
    outfile = setOutput('default')
  }
  
  # Analysis identifier for javascript:
  outfiletype = paste(vars[[Analysis$vindex]][['Name']][1],tolower(Analysis$type))
  
  if(type!="MultiObs" & type!="MultiObsMap" & vars[[1]]$Name!="Qs" & vars[[1]]$Name!="RC" & vars[[1]]$Name!="BFI"){
    # Check obs or model aren't missing variable, their timing is compatible and grids match:
    errcheck = CanAnalysisProceed(obs, model)
    if(errcheck$err){
      result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                    error=errcheck$errtext,bencherror=bench$errtext,metrics=list(first=list(name='failed',model_value=NA)))
      return(result)
    }
    
    # Test benchmark timing compatibility, and remove any benchmarks if necessary:
    bench = PruneBenchmarks(obs,bench)
  }
  
  # Create mask:
  mask = CreateMask(obs,model,bench,type)
  
  # See if QA exists
  QAexist = ifelse((vars[[Analysis$vindex]]$Name=="VISalbedo" | vars[[Analysis$vindex]]$Name=="NIRalbedo"),TRUE,FALSE)[1]
  
  
  # Call analysis function:	
  if(type=="MultiObsMap"){
    
    if(Analysis$type=='TimeMean'){
      metrics_data = list()
      for(i in 1:length(obs)){
        metrics_data[[i]] = TimeMeanAll(model=model[[i]],obs[[i]],bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask[[i]],cl,region,QAexist)
      }
      md = FindCommonRange(metrics_data)
      areturn = list()
      outfile = list()
      for(i in 1:length(obs)){
        #if(obs[[i]]$name=="LandFlux ET"){modelv = model[[2]]}else{modelv = model[[1]]}
        outfile[[i]] = setOutput('default')
        areturn[[i]] = SpatialPlotAbsolute(model[[i]],obs[[i]],bench,md=md[[i]],
                                           variable=vars[[Analysis$vindex]],mask[[i]],plottype=Analysis$type,region,QAexist)
      }
      
    }else if(Analysis$type == 'TimeSD'){
      metrics_data = list()
      for(i in 1:length(obs)){
        metrics_data[[i]] = TimeSDAll(model=model[[i]],obs[[i]],bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask[[i]],cl,region,QAexist)
      }
      md = FindCommonRange(metrics_data)
      areturn = list()
      outfile = list()
      for(i in 1:length(obs)){
        outfile[[i]] = setOutput('default')
        areturn[[i]] = SpatialPlotAbsolute(model[[i]],obs[[i]],bench,md=md[[i]],
                                           variable=vars[[Analysis$vindex]],mask[[i]],plottype=Analysis$type,region,QAexist)
      }
      
    }else if(Analysis$type == 'TimeRMSE'){
      metrics_data = list()
      for(i in 1:length(obs)){
        metrics_data[[i]] = TimeRMSEAll(model=model[[i]],obs[[i]],bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask[[i]],cl,region,QAexist)
      }
      md = FindCommonRange(metrics_data)
      areturn = list()
      outfile = list()
      for(i in 1:length(obs)){
        outfile[[i]] = setOutput('default')
        areturn[[i]] = SpatialPlotRelative(model[[i]],obs[[i]],bench,md=md[[i]],
                                           variable=vars[[Analysis$vindex]],mask[[i]],plottype=Analysis$type,region,QAexist)
      } 
      
    }else if(Analysis$type == 'TimeCor'){
      metrics_data = list()
      for(i in 1:length(obs)){
        metrics_data[[i]] = TimeCorAll(model=model[[i]],obs[[i]],bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask[[i]],cl,region,QAexist)
      }
      md = FindCommonRange(metrics_data)
      areturn = list()
      outfile = list()
      for(i in 1:length(obs)){
        outfile[[i]] = setOutput('default')
        areturn[[i]] = SpatialPlotRelative(model[[i]],obs[[i]],bench,md=md[[i]],
                                           variable=vars[[Analysis$vindex]],mask[[i]],plottype=Analysis$type,region,QAexist)
      }
      
    }else{
      result = list(errtext = paste('Unknown analysis type \'',Analysis$type,
                                    '\' requested in function DistributeGriddedAnalyses.',sep=''),err=TRUE)
      return(result)
    }
    
    
  }else{
    
    
    # --------------------------------------------------------------------------------------------------------------------------------  
    # Call analysis function:  
    if(Analysis$type == 'TimeMean'){
      metrics_data = TimeMeanAll(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,QAexist)
      areturn = SpatialPlotAbsolute(model,obs,bench,md=metrics_data,
                                    variable=vars[[Analysis$vindex]],mask,plottype=Analysis$type,region,QAexist)
    }else if(Analysis$type == 'TimeSD'){
      metrics_data = TimeSDAll(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,QAexist)
      areturn = SpatialPlotAbsolute(model,obs,bench,metrics_data,
                                    variable=vars[[Analysis$vindex]],mask,plottype=Analysis$type,region,QAexist)
    }else if(Analysis$type == 'TimeRMSE'){
      metrics_data = TimeRMSEAll(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,QAexist)
      areturn = SpatialPlotRelative(model,obs,bench,metrics_data,
                                    variable=vars[[Analysis$vindex]],mask,plottype=Analysis$type,region,QAexist)		
    }else if(Analysis$type == 'TimeCor'){
      metrics_data = TimeCorAll(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,QAexist)
      areturn = SpatialPlotRelative(model,obs,bench,metrics_data,
                                    variable=vars[[Analysis$vindex]],mask,plottype=Analysis$type,region,QAexist)	
    }else if(Analysis$type == 'Timeseries'){                                               
      metrics_data = Timeseries_MultiObs_unc(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,outfile) 
      #metrics_data = Timeseries_unc(model,obs,bench,variable=vars[[Analysis$vindex]],plottype=Analysis$type,mask,cl,region,outfile)
      areturn = list(errtext=metrics_data$errtext,err=FALSE,metrics=metrics_data$metrics)
    }else{
      result = list(errtext = paste('Unknown analysis type \'',Analysis$type,
                                    '\' requested in function DistributeGriddedAnalyses.',sep=''),err=TRUE)
      return(result)
    }
  }
  # -------------------------------------------------------------------------------------------------------------------------------- 
  if(type!="MultiObsMap"){
    if(areturn$errtext=='ok'){	
      result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                    metrics = areturn$metrics,analysistype=Analysis$type, 
                    variablename=vars[[Analysis$vindex]][['Name']][1],bencherror=bench$errtext)
    }else{
      cat('\n###',areturn$errtext,'###\n')
      result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                    metrics = areturn$metrics,analysistype=Analysis$type, 
                    variablename=vars[[Analysis$vindex]][['Name']][1],error=areturn$errtext,bencherror=bench$errtext)
    }	
  }else{
    if(areturn[[length(areturn)]]$errtext=='ok'){  
      filename=list()
      metrics = list()
      for(i in 1:length(obs)){                  
        filename[[i]]=paste(getwd(),outfile[[i]],sep = "/")
        metrics[[i]]=areturn[[i]]$metrics
      }
      result = list(type=outfiletype,filename=filename,mimetype="image/png",
                    metrics = metrics,analysistype=Analysis$type, 
                    variablename=vars[[Analysis$vindex]][['Name']][1],bencherror=bench$errtext)
    }else{
      cat('\n###',areturn$errtext,'###\n')
      result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                    metrics = metrics,analysistype=Analysis$type, 
                    variablename=vars[[Analysis$vindex]][['Name']][1],error=areturn[[length(areturn)]]$errtext,bencherror=bench$errtext)
    }	 
  }
  
return(result)
}


DistributeSingleSiteAnalyses = function(Analysis,data,vars){
  
  # Create outfilename:
  outfile = setOutput('ModelAnalysis')
  
  # First deal with multiple-variable analyses:
  if(Analysis$type == 'Conserve'){
    # No single variable, so 'multiple' returned in javascript:
    varname = 'multiple'
    # Analysis identifier for javascript:
    outfiletype = Analysis$type
    
  }else if(Analysis$type == 'EvapFrac'){
    # No single variable, so 'multiple' returned in javascript:
    varname = 'multiple'
    # Analysis identifier for javascript:
    outfiletype = Analysis$type
    
  }else{ # Analysis will be for a single variable.
    # The name of this variable
    varname = vars[[Analysis$vindex]][['Name']][1]
    # Units expression:
    unitstxt = vars[[Analysis$vindex]][['UnitsText']]
    # Longer variable name for plots:
    longvarname = vars[[Analysis$vindex]][['PlotName']]
    # File name for graphics file:
    filestring = paste(getwd(),outfile,sep = "/")
    # Analysis identifier for javascript:
    outfiletype = paste(varname,tolower(Analysis$type))
    
    # Check obs or model aren't missing variable data and and that their timing is compatible:
    errcheck = CanAnalysisProceed(data[[Analysis$vindex]]$obs,data[[Analysis$vindex]]$model)
    if(errcheck$err){
      result = list(type=outfiletype,filename=filestring,mimetype="image/png",analysistype=Analysis$type,
                    error=errcheck$errtext,bencherror=data[[Analysis$vindex]]$bench$errtext,
                    metrics=list(first=list(name='failed',model_value=NA)),variablename=varname)
      return(result)
    }
    
    # Test benchmark timing compatibility, and remove any benchmarks if necessary:
    data[[Analysis$vindex]]$bench = PruneBenchmarks(data[[Analysis$vindex]]$obs,data[[Analysis$vindex]]$bench)
    
    # Create data matrix to send to analysis function:
    adata=matrix(NA,length(data[[Analysis$vindex]]$obs$data),(2+data[[Analysis$vindex]]$bench$howmany))
    adata[,1] = data[[Analysis$vindex]]$obs$data
    adata[,2] = data[[Analysis$vindex]]$model$data
    # Add benchmark data, if any:
    if(data[[Analysis$vindex]]$bench$exist){
      for(b in 1: (data[[Analysis$vindex]]$bench$howmany) ){
        adata[,(b+2)] = data[[Analysis$vindex]]$bench[[ data[[Analysis$vindex]]$bench$index[b] ]]$data
      }
    }
    
    # Add obs quality control data, if present:		
    if(data[[Analysis$vindex]]$obs$qcexists){
      vqcdata = matrix(NA,length(data[[Analysis$vindex]]$obs$data),1)
      vqcdata[,1] = data[[Analysis$vindex]]$obs$qc
    }else{
      vqcdata = matrix(-1,nrow=1,ncol=1)
    }
    
    # For adding to plots:
    obsname = data[[Analysis$vindex]]$obs$name
    moname = data[[Analysis$vindex]]$model$name
    benchnames = c()
    if(data[[Analysis$vindex]]$bench$exist){
      for(b in 1: (data[[Analysis$vindex]]$bench$howmany) ){
        benchnames[b] = data[[Analysis$vindex]]$bench[[ data[[Analysis$vindex]]$bench$index[b] ]]$name
      }
    }
    
    legendtext = LegendText(data[[Analysis$vindex]],plotobs=TRUE)
    plotcolours = BenchmarkColours(data[[Analysis$vindex]]$bench,plotobs=TRUE)
    
    # Call analysis function:	
    if(Analysis$type == 'Timeseries'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      plotcex = 1.1 # plot text magnification factor
      winsize = 14
      ytext=bquote('Smoothed'~.(tolower(longvarname)) ~ ' (' ~ .(unitstxt) ~ ')')
      areturn = Timeseries(obsname,adata,varname,ytext,legendtext,plotcex,
                           data[[Analysis$vindex]]$obs$timing,smoothed=TRUE,winsize,plotcolours,
                           moname,vqcdata=vqcdata)				
    }else if(Analysis$type == 'AnnualCycle'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      ytext = bquote('Average'~.(tolower(longvarname)) ~ ' (' ~ .(unitstxt) ~ ')')
      areturn = AnnualCycle(obsname,adata,varname,ytext,legendtext,
                            data[[Analysis$vindex]]$obs$timing$tstepsize,
                            data[[Analysis$vindex]]$obs$timing$whole,plotcolours,moname)
    }else if(Analysis$type == 'DiurnalCycle'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      ytext=bquote('Average'~.(varname) ~ ' (' ~.(unitstxt) ~ ')')
      areturn = DiurnalCycle(obsname,adata,varname,ytext,legendtext,
                             data[[Analysis$vindex]]$obs$timing$tstepsize,
                             data[[Analysis$vindex]]$obs$timing$whole,plotcolours,moname,vqcdata=vqcdata)
    }else if(Analysis$type == 'PDF'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      nbins=500
      xtext=bquote(.(longvarname) ~ ' (' ~ .(unitstxt) ~ ')')
      areturn = PALSPdf(obsname,adata,varname,xtext,legendtext,
                        data[[Analysis$vindex]]$obs$timing,nbins,plotcolours,moname,vqcdata=vqcdata)
    }else if(Analysis$type == 'Scatter'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      areturn = PALSScatter(data[[Analysis$vindex]],vars[[Analysis$vindex]],ebal=FALSE)
    }else if(Analysis$type == 'Taylor'){
      bencherrtext = data[[Analysis$vindex]]$bench$errtext
      areturn = TaylorDiagram(data[[Analysis$vindex]],vars[[Analysis$vindex]],plotcolours)
    }else if(Analysis$type == 'AvWindow'){
      # Not a benhcmark plot for the moment:
      bencherrtext = 'Benchmark analysis not available for this analysis type'
      ytext=bquote('Average'~.(longvarname) ~ .(unitstxt))
      areturn = AveragingWindow(obsname,moname,data[[Analysis$vindex]]$model$data,
                                data[[Analysis$vindex]]$obs$data,varname,ytext,
                                data[[Analysis$vindex]]$obs$timing$tstepsize)
    }
    
  }
  # Don't return errtext in output list unless there is an error - as requested by Eden
  if(areturn$errtext=='ok'){	
    result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                  metrics = areturn$metrics,analysistype=Analysis$type, variablename=varname,
                  bencherror=bencherrtext,obsname=obsname,moname=moname,benchnames=benchnames)
  }else{
    cat('\n###',areturn$errtext,'###\n')
    result = list(type=outfiletype,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
                  metrics = areturn$metrics,analysistype=Analysis$type, variablename=varname,
                  error=areturn$errtext,bencherror=bencherrtext,obsname=obsname,moname=moname,benchnames=benchnames)
  }	
  
  return(result)
}


SeparateEval = function(data){
  # Separate EvalDataSetFiles according to name and variable
  # Initialize fields
  DataOut = list()
  name = list()
  variable = list()
  idx = list()
  
  # Collect DataSet names and variables
  for(d in 1:length(data)){
    name[d] = data[[d]]$name
    variable[d] = data[[d]]$variable
  }
  
  # Find unique variables and names
  univar = unique(variable)
  uniname = unique(name)
  
  # Concatenate strings
  lmat = paste(variable,name)
  smat = paste(univar,uniname)
  
  # Write separated data to DataOut
  for(i in 1:length(smat)){
    idx[[i]] = which(smat[i]==lmat)
  }
  for(n in 1:length(idx)) {
    DataOut[[n]] = data[idx[[n]]]
  }
  
  return(DataOut)  
}

SeparateFilelist = function(filelist){
  # Separate the filelist into variable files and QA files
  var = list()
  QA = list()
  sepfilelist = list(var = var, QA = QA)
  varcnt = 1
  qacnt = 1
  for(i in 1:length(filelist)){
    if(filelist[[i]]$QA == "true"){
      sepfilelist$QA[[qacnt]] = filelist[[i]]
      qacnt = qacnt + 1
    }else if(filelist[[i]]$QA == "false"){
      sepfilelist$var[[varcnt]] = filelist[[i]]
      varcnt = varcnt + 1
    }
  }
  return(sepfilelist)
}


EvalType = function(data){
  # Initialize fields
  name = list()
  variable = list()
  errtext = "ok"
  
  # Collect DataSet names and variables
  for(d in 1:length(data)){
    name[d] = data[[d]]$name
    variable[d] = data[[d]]$variable
  }
  
  # Find unique variables and names
  univar = unique(variable)
  uniname = unique(name)
  
  # Define the type of EvalDataSet
  if((length(univar)==1) & (length(uniname)>1) & (sum((uniname=="MPI_uncertainty")==TRUE)==1) ){
    type = "MultiObs"
  }else if((length(univar)==1) & (length(uniname)>1) & (sum((uniname=="MPI_uncertainty")==TRUE)==0) ){
    type = "MultiObsMap"
  }else if((length(univar)>1) & (length(uniname)==1)){
    type = "MultiVar"
  }else if((length(univar)==1) & (length(uniname)==1)){
    type = "Single"
  }else if((length(univar)>1) & (length(uniname)>1)){
    type = "Multiple"
  }else{
    errtext = "Unknown EvalDataSet type in SeparateEval function."
    result = list(err=TRUE, errtext=errtext)
    return(result)  
  }
  
  result = list(type=type,err=FALSE,errtext=errtext)
  return(result) 
}
