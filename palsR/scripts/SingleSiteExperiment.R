# Master script for single site flux tower based experiments
# Gab Abramowitz, UNSW, 2016 (palshelp at gmail dot com)

library(pals)
library(parallel)

# Nominate variables to analyse here (use ALMA standard names) - fetches
# alternate names, units, units transformations etc:
vars = GetVariableDetails(c('Qle','Qh','NEE','Rnet','Qg','SWnet'))

# Analyses that can apply to any variable:
analyses = c('Timeseries','Taylor','AnnualCycle','DiurnalCycle','Scatter','PDF')

# Determine how many MOs, Benchmarks and DSs are in input files.
ModelOutputInfo = FindFileTypes(input[["files"]],'ModelOutput')  
DataSetInfo = FindFileTypes(input[["files"]], 'DataSet')
BenchmarkInfo = FindFileTypes(input[["files"]],'Benchmark')

# Set up analysis data and analysis list so we can use lapply or parlapply:
AnalysisData = list()
AnalysisList = list()

# Load all variables from obs and model output
ctr = 0
for(v in 1:length(vars)){
	# Get first file of first DataSet:
	obs = GetFluxnetVariable(vars[[v]],DataSetInfo$unit[[1]]$name,DataSetInfo$unit[[1]]$filepaths[1])
	# Get all files for first ModelOutput:
    model = GetModelOutput(vars[[v]],ModelOutputInfo$unit[[1]]$name,ModelOutputInfo$unit[[1]]$filepaths)
    # Get all files for all user-nominated benchmarks:
    bench = GetBenchmarks(vars[[v]],BenchmarkInfo)
	# Save model, obs, bench data for each variable:
	AnalysisData[[v]] = list(obs=obs, model=model, bench = bench)
	# Add those analyses that are equally applicable to any variable to analysis list:
	for(a in 1:length(analyses)){
		ctr = ctr + 1
		AnalysisList[[ctr]] = list(vindex=v, type=analyses[a])
	}
}
# Add multiple variable analysis to analysis list:
# analysis_number = analysis_number + 1
# AnalysisList[[analysis_number]] = list(vindex=0, type='EvapFrac')
# analysis_number = analysis_number + 1
# AnalysisList[[analysis_number]] = list(vindex=0, type='Conserve')

# Create cluster:
cl = makeCluster(getOption('cl.cores', detectCores()))
#cl = makeCluster(getOption('cl.cores', 4))

# Process analyses using lapply:
#outinfo = lapply(AnalysisList,DistributeSingleSiteAnalyses,data=AnalysisData,vars=vars)
outinfo = parLapply(cl=cl,AnalysisList,DistributeSingleSiteAnalyses,data=AnalysisData,vars=vars)

# stop cluster
stopCluster(cl)

# Draw summary metric table here (adds to outinfo list):
outinfo = MetricTableSingleSite(outinfo,BenchmarkInfo)

# Write outinfo to output list for javascript:
output = list(files=outinfo);

PrintAnalysisResult(output) # useful when testing