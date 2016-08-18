# DistributeAnalyses.R
#
# Functions associated with distributing analyses across multiple cores
#
# Gab Abramowitz, UNSW, 2016 (palshelp at gmail dot com)

DistributeAnalysisCalculation = function(Analysis,vars,obs,model,bench,region,mask,cluster){
	# Each call to this function will generate the values for a single plot 
	# and a list of associated metrics (but will not generate the plots themselves).
	
	# First check if loading or compatibility issues mean this analysis cannot proceed:
	if(Analysis$err){
		result = Analysis
		result$metrics = list( plotvalues=NA, metric=list(NA),err=TRUE,errtext=Analysis$errtext)
		return(result)
	}
	# Then collate data to calculate analysis values:	
	plotdata=list() 
	if((Analysis$ModelOutput==FALSE) & (Analysis$Benchmark==FALSE)){ # metric on obs product(s)
		for(o in 1:length(Analysis$DataSet)){ # Add all DataSets for this analysis
			plotdata[[o]] = obs[[ Analysis$DataSet[o] ]]$data
		}
	}else if((Analysis$DataSet==FALSE) & (Analysis$Benchmark==FALSE)){ # metric on MO(s)
		for(m in 1:length(Analysis$ModelOutput)){ # Add all MO for this analysis
			plotdata[[m]] = model[[ Analysis$ModelOutput[m] ]]$data
		}
	}else if((Analysis$ModelOutput==FALSE) & (Analysis$DataSet==FALSE)){ #  Benchmark(s)
		for(b in 1:length(Analysis$Benchmark)){
			plotdata[[b]] = bench[[ Analysis$Benchmark[b] ]]$data
		}
	}else if(Analysis$Benchmark==FALSE){ 		# i.e. MO(s) and obs only
		for(o in 1:length(Analysis$DataSet)){ 	# Add all DataSets for this analysis
			plotdata[[o]] = obs[[ Analysis$DataSet[o] ]]$data
		}
		for(m in 1:length(Analysis$ModelOutput)){ # Add all MO for this analysis
			plotdata[[ (length(Analysis$DataSet)+m) ]] = model[[ Analysis$ModelOutput[m] ]]$data
		}
	}else if(Analysis$ModelOutput==FALSE){ 		# i.e. Benchmark and obs only
		for(o in 1:length(Analysis$DataSet)){ 	# Add all DataSets for this analysis
			plotdata[[o]] = obs[[ Analysis$DataSet[o] ]]$data
		}
		for(b in 1:length(Analysis$Benchmark)){
			plotdata[[ (length(Analysis$DataSet)+b) ]] = bench[[ Analysis$Benchmark[b] ]]$data
		}
	}else{
		result = Analysis
		result$err = TRUE # i.e.analysis failed 
		result$errtext = 'DistributeGriddedAnalyses cannot yet handle multiple MO analysis.'
		result$metrics = list( plotvalues=NA, metric=list(NA),err=TRUE,errtext=result$errtext)
		return(result)
	}
	result = Analysis
	# Get Analysis values:
	result$metrics = SinglePlotValues(Analysis,mask,region,plotdata,cluster)
	result$err = result$metrics$err # make sure any failure is reported
	result$errtext = result$metrics$errtext
	return(result)
}

DistributePlots = function(Analysis,vars,grid,region,ranges,bench){
	# Each call to this function will use pre-calculated plot values (in "Analysis") and generate a single plot.
	
	# Create outfilename:
	outfile = setOutput('default')
	
	# First check if loading or compatibility issues mean this analysis cannot proceed:
	if(Analysis$err){
		result = list(analysisname=Analysis$name,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
			error=Analysis$errtext,bencherror=bench$errtext,metrics=list(first=list(name='failed',model_value=NA)))
		return(result)
	}
	varname = vars[[Analysis$vindex]][['Name']][1]
	unitstxt = vars[[Analysis$vindex]][['UnitsText']]
	longvarname = vars[[Analysis$vindex]][['PlotName']]
	densityLocation = DensityLocation(region,1) # for density plot inset
	textLocation = TextLocation(region,1) # for text inset
	if(ranges[[Analysis$plotgroup]]$diffplot){
		colourscaletype = 'difference'
	}else{
		colourscaletype = 'positive'
	}
	cols = ChooseColours(ranges[[Analysis$plotgroup]]$range,varname,colourscaletype)
	
	errtext = DrawPlot(region,grid$lon,grid$lat,Analysis$metrics$plotvalues,Analysis$metrics$plotmean,
		Analysis$metrics$plotsd,varname,unitstxt,longvarname,ranges[[Analysis$plotgroup]]$range,cols,
		Analysis$plottitle,textLocation)
		
	in1 = InsetDensity(densityLocation[[1]],Analysis$metrics$plotden,ranges[[Analysis$plotgroup]]$drange)
	
	if(errtext=='ok'){	
		result = list(analysisname=Analysis$name,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
			metrics = Analysis$metrics$metrics,analysistype=Analysis$type, 
			variablename=vars[[Analysis$vindex]][['Name']][1],bencherror=bench$errtext)
	}else{
		cat('\n###',errtext,'###\n')
		result = list(analysisname=Analysis$name,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
			metrics = Analysis$metrics$metrics,analysistype=Analysis$type, 
			variablename=vars[[Analysis$vindex]][['Name']][1],error=errtext,bencherror=bench$errtext)
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
		analysisname = Analysis$type
	
	}else if(Analysis$type == 'EvapFrac'){
		# No single variable, so 'multiple' returned in javascript:
		varname = 'multiple'
		# Analysis identifier for javascript:
		analysisname = Analysis$type
	
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
		analysisname = paste(varname,tolower(Analysis$type))
		
		# Check obs or model aren't missing variable data and and that their timing is compatible:
		errcheck = CanAnalysisProceed(data[[Analysis$vindex]]$obs,data[[Analysis$vindex]]$model)
		if(errcheck$err){
			result = list(type=analysisname,filename=filestring,mimetype="image/png",analysistype=Analysis$type,
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
		result = list(type=analysisname,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
			metrics = areturn$metrics,analysistype=Analysis$type, variablename=varname,
			bencherror=bencherrtext,obsname=obsname,moname=moname,benchnames=benchnames)
	}else{
		cat('\n###',areturn$errtext,'###\n')
		result = list(type=analysisname,filename=paste(getwd(),outfile,sep = "/"),mimetype="image/png",
			metrics = areturn$metrics,analysistype=Analysis$type, variablename=varname,
			error=areturn$errtext,bencherror=bencherrtext,obsname=obsname,moname=moname,benchnames=benchnames)
	}	

	return(result)
}

CreateAnalysisList = function(Analyses,vars,ModelOutputInfo,DataSetInfo,
		BenchmarkInfo,obs,model,bench,TrigMOonly){ # Creates a list of analyses to send to lapply / mclapply
			
	# First create list of all possible requested analyses:
	AllAnalysisList=CreateCompleteAnalysisList(Analyses,vars,ModelOutputInfo,DataSetInfo,BenchmarkInfo,TrigMOonly)
		
	if(TrigMOonly){
		numberMO = 1		
	}else{
		numberMO = ModelOutputInfo$number
	}
	# Initialise matrix of obs-model compatibilities:
	compatible = matrix(FALSE,DataSetInfo$number,(numberMO+BenchmarkInfo$number))
	compatibletext = matrix('ok',DataSetInfo$number,(numberMO+BenchmarkInfo$number))
	# Then check whether DSs, MOs and Benchmarks are compatible with each other in 
	# terms of variable, timing and grid:
	for (o in 1:DataSetInfo$number){
		if(! obs[[o]]$err){ # there was no error loading the DS
			for(m in 1:numberMO){
				if(! model[[m]]$err){ # there was no error loading the MO
					chk = CanAnalysisProceed(obs[[o]],model[[m]])
					compatible[o,m] = ! chk$err # since no error (FALSE) => compatible
					compatibletext[o,m] = chk$errtext
				}else{ # err loading MO
					compatible[o,m] = ! model[[m]]$err # since loading err => not compatible
					compatibletext[o,m] = model[[m]]$errtext	
				}
			}
			if(bench$exist){
				for(b in 1:BenchmarkInfo$number){
					if(! bench[[b]]$err){ # there was no error loading the Benchmark
						chk = CanAnalysisProceed(obs[[o]],bench[[b]])
						compatible[o,(numberMO+b)] = ! chk$err # since no error (FALSE) => compatible
						compatibletext[o,(numberMO+b)] = chk$errtext
					}else{ # err loading Benchmark
						compatible[o,(numberMO+b)] = ! bench[[b]]$err
						compatibletext[o,(numberMO+b)] = bench[[b]]$errtext	
					}
				}
			}
		}else{ # err loading DS
			compatible[o,] = ! obs[[o]]$err
			compatibletext[o,] = obs[[o]]$errtext	
		}		
	}
	
	# Now remove any analyses based on failed obs data sets - assume these are driving data sets
	# AND make sure any compatibility issues, or failed MO or Benchmark loading is reflected in Analysis
	# error messages:
	AnalysisList = list()
	actr = 0
	for(a in 1:length(AllAnalysisList)){		
		if(AllAnalysisList[[a]]$DataSet != FALSE){ # does use an obs DS
			if(! obs[[ AllAnalysisList[[a]]$DataSet ]]$err){ # and there was no error loading it
				actr = actr + 1 # increment analysis counter
				AnalysisList[[actr]] = AllAnalysisList[[a]] # copy analysis details		
				if(AllAnalysisList[[a]]$ModelOutput != FALSE){ # does use a ModelOutput
					AnalysisList[[actr]]$err = ! compatible[AllAnalysisList[[a]]$DataSet, AllAnalysisList[[a]]$ModelOutput]
					AnalysisList[[actr]]$errtext = compatibletext[AllAnalysisList[[a]]$DataSet, AllAnalysisList[[a]]$ModelOutput]
				}else if(AllAnalysisList[[a]]$Benchmark != FALSE){ # does use a Benchmark
					AnalysisList[[actr]]$err = ! compatible[AllAnalysisList[[a]]$DataSet,(numberMO+AllAnalysisList[[a]]$Benchmark)]
					AnalysisList[[actr]]$errtext = compatibletext[AllAnalysisList[[a]]$DataSet,(numberMO+AllAnalysisList[[a]]$Benchmark)]
				} # else obs only analysis, and there was no error	
			}
		}else if(AllAnalysisList[[a]]$ModelOutput != FALSE){ # does use a model output
			# MO only analyses, since does not use obs/ds
			actr = actr + 1 # increment analysis counter
			AnalysisList[[actr]] = AllAnalysisList[[a]] # copy analysis details
			AnalysisList[[actr]]$err = model[[ AllAnalysisList[[a]]$ModelOutput ]]$err
			AnalysisList[[actr]]$errtext = model[[ AllAnalysisList[[a]]$ModelOutput ]]$errtext
		}else{
			# Benchmark only analysis	
			actr = actr + 1 # increment analysis counter
			AnalysisList[[actr]] = AllAnalysisList[[a]] # copy analysis details
			AnalysisList[[actr]]$err = bench[[ AllAnalysisList[[a]]$Benchmark ]]$err
			AnalysisList[[actr]]$errtext = bench[[ AllAnalysisList[[a]]$Benchmark ]]$errtext
			
		}
	}
	return(AnalysisList)
}

CreateCompleteAnalysisList = function(Analyses,vars,ModelOutputInfo,DataSetInfo,BenchmarkInfo,TrigMOonly=TRUE){
	# Create a list of all analyses, for all obs, triggering MO and benchmarks
	# TrigMOonly => triggering MO, rather than all MO in experiment
	# (but no obs-obs or model-model comparison except benchmarks)
	if(TrigMOonly){
		numberMO = 1		
	}else{
		numberMO = ModelOutputInfo$number
	}	
	
	AnalysisList = list()
	ctr = 0 # counter for analyses
	pgctr = 0 # counter for plot groups (used to make sure plots have same axes/colourbars)
	for(v in 1:length(vars)){
		for(a in 1:length(Analyses)){
			pgctr = pgctr + 1
			# For 'absolute' analysis types - that can run on obs or model
			if(any(absoluteMetric==Analyses[a])){
				# One plot for each obs product:
				for(ds in 1:DataSetInfo$number){
					if(DataSetInfo$number == 1){
						AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Obs')
					}else{
						AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Obs',ds)
					}
					plottitle = paste0(DataSetInfo$names[ds],' ',vars[[v]][['PlotName']],' ',Analyses[a])
					ctr = ctr + 1
					AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],ModelOutput=FALSE,var=vars[[v]]$name[1],
						plotgroup=pgctr,DataSet=c(ds),Benchmark=FALSE,Difference=FALSE,name=AnalysisName,
						plottitle=plottitle,err=FALSE,errtext='ok')	
				}
				# One for each Model Output:
				for(m in 1:numberMO){
					if(ModelOutputInfo$number == 1){
						modelnum='Model'
					}else{
						modelnum=paste0('Model',m)
					}
					plottitle = paste0(ModelOutputInfo$names[m],' ',vars[[v]][['PlotName']],' ',Analyses[a])
					ctr = ctr + 1
					AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],plotgroup=pgctr,ModelOutput=c(m),
						DataSet=FALSE,Benchmark=FALSE,Difference=FALSE,var=vars[[v]]$name[1],plottitle=plottitle,
						name=paste0(vars[[v]]$name[1],type=Analyses[a],modelnum),err=FALSE,errtext='ok')
					# And one for the diff between each MO and obs product (note also this is a new plot group):	
					for(ds in 1:DataSetInfo$number){
						if(DataSetInfo$number == 1){
							AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Diff',modelnum,'Obs')
						}else{
							AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Diff',modelnum,'Obs',ds)
						}
						plottitle = paste0('[',ModelOutputInfo$names[m],'-',DataSetInfo$names[ds],'] ',
							vars[[v]][['PlotName']],' ',Analyses[a])
						ctr = ctr + 1
						AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],plotgroup=(pgctr+1),
							ModelOutput=c(m),var=vars[[v]]$name[1],DataSet=c(ds),Benchmark=FALSE,Difference=TRUE,
							name=AnalysisName,plottitle=plottitle,err=FALSE,errtext='ok')
					}	
				}
				# One for each Benchmark:
				if(BenchmarkInfo$number > 0){
					for(b in 1:BenchmarkInfo$number){
						if(BenchmarkInfo$number == 1){
							benchnum='Bench'
						}else{
							benchnum=paste0('Bench',b)
						}
						plottitle = paste0(BenchmarkInfo$names[b],' ',vars[[v]][['PlotName']],' ',Analyses[a])
						ctr = ctr + 1
						AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],ModelOutput=FALSE,plotgroup=pgctr,
							DataSet=FALSE,Benchmark=c(b),Difference=FALSE,var=vars[[v]]$name[1],plottitle=plottitle,
							name=paste0(vars[[v]]$name[1],Analyses[a],benchnum),err=FALSE,errtext='ok')
						# And one for the diff between each Benchmark and obs product:	
						for(ds in 1:DataSetInfo$number){
							if(DataSetInfo$number == 1){
								AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Diff',benchnum,'Obs')
							}else{
								AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],'Diff',benchnum,'Obs',ds)
							}
							plottitle = paste0('[',BenchmarkInfo$names[b],'-',DataSetInfo$names[ds],'] ',
								vars[[v]][['PlotName']],' ',Analyses[a])
							ctr = ctr + 1
							AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],plotgroup=(pgctr+1),
								var=vars[[v]]$name[1],ModelOutput=FALSE,DataSet=c(ds),Benchmark=c(b),Difference=TRUE,
								name=AnalysisName,plottitle=plottitle,err=FALSE,errtext='ok')
						}	
					}
				}
				# Increment plot group counter here as well as top of routine, to account for abs analysis diff plots
				pgctr = pgctr + 1
			}else{
				# For 'relative' analysis types - that use both obs and model
				# One for each Model Output - Obs combination:
				for(m in 1:numberMO){
					if(ModelOutputInfo$number == 1){
						modelnum=''
					}else{
						modelnum=paste0('Model',m)
					}
					for(ds in 1:DataSetInfo$number){
						if(DataSetInfo$number == 1){
							AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],modelnum,'')
						}else{
							AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],modelnum,'Obs',ds)
						}
						plottitle = paste0(ModelOutputInfo$names[m],' ',vars[[v]][['PlotName']],' ',Analyses[a],
							' [',DataSetInfo$names[ds],']')
						ctr = ctr + 1
						AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],ModelOutput=c(m),
							var=vars[[v]]$name[1],plotgroup=pgctr,DataSet=c(ds),Benchmark=FALSE,Difference=FALSE,
							name=AnalysisName,plottitle=plottitle,err=FALSE,errtext='ok')
					}	
				}
				# One for each Benchmark - Obs combination:
				if(BenchmarkInfo$number > 0){
					for(b in 1:BenchmarkInfo$number){
						if(BenchmarkInfo$number == 1){
							benchnum='Bench'
						}else{
							benchnum=paste0('Bench',b)
						}
						for(ds in 1:DataSetInfo$number){
							if(DataSetInfo$number == 1){
								AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],benchnum)
							}else{
								AnalysisName=paste0(vars[[v]]$name[1],Analyses[a],benchnum,'Obs',ds)
							}
							plottitle = paste0(BenchmarkInfo$names[b],' ',vars[[v]][['PlotName']],' ',Analyses[a],
								' [',DataSetInfo$names[ds],']')
							ctr = ctr + 1
							AnalysisList[[ctr]] = list(vindex=v,type=Analyses[a],var=vars[[v]]$name[1],
								plotgroup=pgctr,ModelOutput=FALSE,DataSet=c(ds),Benchmark=c(b),Difference=FALSE,
								name=AnalysisName,plottitle=plottitle,err=FALSE,errtext='ok')
						}	
					}
				}
			}
		}
	}
	return(AnalysisList)
}
