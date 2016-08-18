# Master script for Global 0.5 x 0.5 degree experiment
# Gab Abramowitz, UNSW, 2016 (palshelp at gmail dot com)
#
library(pals)
library(parallel)

region = 'Global' # 'Global', 'Australia'

# Analyses that can apply to any variable:
Analyses = c('TimeMean','TimeRMSE','TimeSD','TimeCor') #'TimeMean','TimeRMSE','TimeSD','TimeCor','PDFall','PDF2D','Taylor')

# Nominate variables to analyse here (use ALMA standard names) - fetches
# alternate names, units, units transformations etc:
vars = GetVariableDetails(c('Qle'))

TrigMOonly=TRUE # Analyse all MO or just triggering MO?

# Determine how many MOs, Benchmarks and DSs are in input files, 
# as well as fetching variable and grid information. 
ModelOutputInfo = FindFileTypes(input[["files"]],'ModelOutput') # Analyse all MO or just triggering MO?
DataSetInfo = FindFileTypes(input[["files"]],'DataSet')
BenchmarkInfo = FindFileTypes(input[["files"]],'Benchmark')

# NEED to read in all obs here... maybe all MOs?
# how to handle multiple analysis variables in one MO/DS?
obs = list(); model = list()
obs[[1]] = GetGLEAM_Global(vars[[1]],DataSetInfo$unit[[1]]$filepaths,force_interval='monthly')

model[[1]] = GetModelOutput(vars[[1]],ModelOutputInfo$unit[[1]]$name,ModelOutputInfo$unit[[1]]$filepath)  
bench = GetBenchmarks(vars[[1]],BenchmarkInfo)

# Create list of analyses using MO, DS and Benchmark info from above, checking whether
# timing is compatible, grids match, and requested analysis variables are present 
AnalysisList = CreateAnalysisList(Analyses,vars,ModelOutputInfo,DataSetInfo,BenchmarkInfo,obs,
			model,bench,TrigMOonly)

spatialmask = CreateCommonMask(obs,model,bench,TrigMOonly) # create spatial mask

# Create cluster to distribute analyses to:
cl = makeCluster(getOption('cl.cores', detectCores()))
		
AnalysisResults = parLapply(cl=cl,AnalysisList,DistributeAnalysisCalculation,vars=vars,
		obs=obs,model=model,bench=bench,region=region,mask=spatialmask,cluster=NULL)

# Make sure the plot ranges are the same for plots from each plot group:
ranges = FindCommonRanges(AnalysisResults)

cat('Between parLapplys:',proc.time()[3],'\n')

# Now generate all plots where analysis results were successful:
OutInfo = parLapply(cl=cl,AnalysisResults,DistributePlots,vars=vars,grid=obs[[1]]$grid,
	region=region,ranges=ranges,bench=bench)

stopCluster(cl) # stop cluster

# Write outinfo to output list for javascript:
output = list(files=OutInfo);

PrintAnalysisResult(output) # useful when testing