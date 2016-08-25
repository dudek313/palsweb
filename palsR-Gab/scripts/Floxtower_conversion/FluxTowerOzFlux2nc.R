# FluxTowerOzFlux2nc.R
#
# Converts data from an OzFlux netcdf file to ALMA netcdf format met and flux files,
# via a PALS template spreadsheet.
#
# Gab Abramowitz and Nadja Herger UNSW 2016 (palshelp at gmail dot com)

rm(list = ls()) # clear all variables
library(gdata)
library(pals)
library(stringr)
library(ncdf4)

basedir = "~/data/"
scriptdir = "~/Documents/admin/PALS/scripts/palsR/scripts/"
SaveToLOG = TRUE
source = "OzFlux"
humidity_type='absolute'
pressure_type='kpa'

# Site specific information
#--------------------------------------
sitename = "CapeTribulation"
#--------------------------------------

PALSdsVersion = "2.0"
FluxTemplateVersion = '1.0.2'

# Fetch site metadata:
source(paste0(scriptdir,'FluxTowerSiteInfo.R'))

qcScript = paste0(basedir, "flux_tower/PALS/ObsUpload/OzFlux/", sitename,source,"QC.R")
csvfile = paste0(basedir,'flux_tower/PALS/ObsUpload/OzFlux/',sitename,source,'Conversion',FluxTemplateVersion,'.csv')

metfilename = paste0(basedir, "flux_tower/PALS/ObsNc/", sitename, source, PALSdsVersion, "_met.nc")
fluxfilename = paste0(basedir, "flux_tower/PALS/ObsNc/", sitename, source, PALSdsVersion, "_flux.nc")

# Start writing to an output file
if (SaveToLOG) {
	sink(paste0(basedir, "flux_tower/PALS/ObsUpload/OzFlux/", sitename, source, "LOG.txt"),append=FALSE)
}

if (source == "DINGO") {
	sourcedir = paste0(basedir, "flux_tower/OzFlux/DINGO")
} else if (source == "OzFlux") { # Use OzFlux nc data
	sourcedir = paste0(basedir, "flux_tower/OzFlux/", sitename, "/default")
}

# Save all Fluxnet file names and list to screen:
allfiles = list.files(path = sourcedir, full.names = TRUE, include.dirs = FALSE)
fnet = allfiles[grepl(".nc", allfiles)]
cat("Found", length(fnet), "file(s).")

# Load PALS template spreadsheet (4x34):
PALSinit = as.matrix(read.xls(paste(basedir,'flux_tower/PALS/ObsUpload/PALSFluxTowerTemplate',FluxTemplateVersion,'.xls',sep='')))
ncols = 34  # is the number of variables + 2 (date and hour)
tctr = 4 # Initialise time step counter, knowing header has to replicate PALS template

# Determine the total number of timesteps (totlength)
totlength = 0
for (i in 1:length(fnet)) {
	fid = nc_open(fnet[i], write = FALSE, readunlim = FALSE)
	totlength = totlength + fid$dim$time$len
}
cat(totlength, "time steps in total. \n")

# Load OzFlux NetCDF File
for (i in 1:length(fnet)) {
	cat("Loading:", fnet[i],'\n')
	fid = nc_open(fnet[i], write = FALSE, readunlim = FALSE)
	# Read in time information
	Second = as.character(ncvar_get(fid, "Second"))
	Second[which(Second == "0")] = "00"
	Minute = as.character(ncvar_get(fid, "Minute"))
	Minute[which(Minute == "0")] = "00"
	Hour = as.character(ncvar_get(fid, "Hour"))
	Day = as.character(ncvar_get(fid, "Day"))
	Month = as.character(ncvar_get(fid, "Month"))
	DecimalHour = ncvar_get(fid, "Hdh")
	# Make sure all Hour, Day, Month strings have two characters:
	for (u in 0:9) {
		Hour[which(Hour == as.character(u))] = paste("0", u, sep = "")
		Day[which(Day == as.character(u))] = paste("0", u, sep = "")
		Month[which(Month == as.character(u))] = paste("0", u, sep = "")
	}
	Year = as.character(ncvar_get(fid, "Year"))
	# Write date
	date = as.character(paste(Day, "/", Month, "/", Year, sep = ""))
	datetime = as.character(paste(Year, "-", Month, "-", Day, " ", Hour, ":", Minute, ":", Second, sep = ""))
	time = as.character(paste(Hour, ":", Minute, ":", Second, sep = ""))
	cat(' - starts',datetime[1],'with time step size',as.numeric(DecimalHour[2])-as.numeric(DecimalHour[1]),'hours \n')
	
	# Missing value
	missval = (fid$var$Ws$missval)
	# if (sitename == "GWWNc") {
		# idx = which(datetime == "2014-12-31 23:30:00")
	# }
	if (i == 1) {
		# Initialize PALSt
		PALSt = matrix(NA, (totlength+3), ncols) # init (3 is the header) 
		PALSt[1:3,1:ncols] = PALSinit[1:3,1:ncols] # write header from template	
		tstepsize = as.numeric(difftime(datetime[2], datetime[1], units = "hours"))
		starttime = list(time = as.double(Hour[1]), day = as.double(Day[1]), month = as.double(Month[1]), year = as.double(Year[1]), timestepsize = tstepsize)
	}
	tsteps = fid$dim$time$len # number of timesteps in 1 file
	variables = attributes(summary(fid$var)[, 1])$names

	# Write date data:
	for (t in 1:(tsteps)) {
		PALSt[(t + tctr - 1), 1] = date[t] # write data in format day/month/year
	}
	PALSt[tctr:(tctr + tsteps - 1), 2] = NA2MissVal(ncvar_get(fid, "Hdh")) # Hour-of-day data: Hdh
	PALSt[tctr:(tctr + tsteps - 1), 3] = NA2MissVal(ncvar_get(fid, "Fsd")) # SWdown, Fsd_Con
	PALSt[tctr:(tctr + tsteps - 1), 4] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fsd_QCFlag")) # SWdownFLAG, Fsd_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 5] = NA2MissVal(ncvar_get(fid, "Fld")) # LWdown, Fld_Con
	PALSt[tctr:(tctr + tsteps - 1), 6] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fld_QCFlag")) # LWdownFLAG, Fld_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 7] = NA2MissVal(ncvar_get(fid, "Ta")) # Tair, Ta_Con
	PALSt[tctr:(tctr + tsteps - 1), 8] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Ta_QCFlag")) # TairFLAG, Ta_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 9] = NA2MissVal(ncvar_get(fid, "Ah")) # Rel H --> Qair, Ah_Con  <-- Abs. instead of specific humidity
	PALSt[tctr:(tctr + tsteps - 1), 10] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Ah_QCFlag")) # RHFLAG <-- QairFLAG, Ah_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 11] = NA2MissVal(ncvar_get(fid, "Ws")) # Windspeed, Ws_Con
	PALSt[tctr:(tctr + tsteps - 1), 12] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Ws_QCFlag")) # WSFLAG, Ws_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 13] = NA2MissVal(ncvar_get(fid, "Precip")) # Rainfall, Precip_Con (mm/30min)
	PALSt[tctr:(tctr + tsteps - 1), 14] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Precip_QCFlag")) # RainfFLAG, Precip_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 15] = QCmissing # snowf
	PALSt[tctr:(tctr + tsteps - 1), 16] = QCmissing # snowfFLAG
	PALSt[tctr:(tctr + tsteps - 1), 17] = NA2MissVal(ncvar_get(fid, "ps")) # pressure, ps_Con (convert from kPa to Pa)
	PALSt[tctr:(tctr + tsteps - 1), 18] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "ps_QCFlag")) # pressureFLAG, ps_Con_QCFlag
	if (sitename == "AliceSpringsNc" | sitename == "TiTreeNc") {
		PALSt[tctr:(tctr + tsteps - 1), 19] = NA2MissVal(ncvar_get(fid, "Cc")) * 0.555556 # CO2, Cc (CO2 conc., mg/m3 -> ppmv)
	} else {
		PALSt[tctr:(tctr + tsteps - 1), 19] = NA2MissVal(ncvar_get(fid, "Cc")) # CO2, Cc (CO2 conc., umol/mol = ppmv)
	}
	PALSt[tctr:(tctr + tsteps - 1), 20] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Cc_QCFlag")) # CO2flag, Cc_QCFlag 
	PALSt[tctr:(tctr + tsteps - 1), 21] = NA2MissVal(ncvar_get(fid, "Fn")) # Rnet, Fn_Con
	PALSt[tctr:(tctr + tsteps - 1), 22] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fn_QCFlag")) # RnetFLAG, Fn_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 23] = NA2MissVal(ncvar_get(fid, "Fsu")) # SWup, Fsu_Con
	PALSt[tctr:(tctr + tsteps - 1), 24] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fsu_QCFlag")) # SWupFLAG, Fsu_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 25] = NA2MissVal(ncvar_get(fid, "Fe")) # LE (latent heat), Fe_Con
	PALSt[tctr:(tctr + tsteps - 1), 26] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fe_QCFlag")) # LEFLAG, Fe_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 27] = NA2MissVal(ncvar_get(fid, "Fh")) # H, Fh_Con
	PALSt[tctr:(tctr + tsteps - 1), 28] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fh_QCFlag")) # HFLAG, Fh_Con_QCFlag
	PALSt[tctr:(tctr + tsteps - 1), 29] = NA2MissVal(ncvar_get(fid, "NEE_SOLO")) # NEE (Net ecosystem exchange CO2)
	PALSt[tctr:(tctr + tsteps - 1), 30] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "NEE_SOLO_QCFlag")) # NEEFLAG
	
	if (sitename == "GWWNc") {
		PALSt[tctr:(tctr + tsteps - 1), 29] = NA2MissVal(ncvar_get(fid, "NEE_FFNET")) # NEE, Fc_ustar (Net ecosystem exchange CO2)
		PALSt[tctr:(tctr + tsteps - 1), 30] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "NEE_FFNET_QCFlag")) # NEEFLAG, Fc_Con_QCFlag 
	} else if (sitename == "AliceSpringsNc" | sitename == "TiTreeNc") {
		PALSt[tctr:(tctr + tsteps - 1), 29] = NA2MissVal(ncvar_get(fid, "NEE")) # NEE, Fc_ustar (Net ecosystem exchange CO2)
		PALSt[tctr:(tctr + tsteps - 1), 30] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "NEE_QCFlag")) # NEEFLAG, Fc_Con_QCFlag 
	} else if (sitename == "TumbarumbaNc") {
		PALSt[tctr:(tctr + tsteps - 1), 29] = NA2MissVal(ncvar_get(fid, "Fc")) # NEE, Fc_ustar (Net ecosystem exchange CO2)
		PALSt[tctr:(tctr + tsteps - 1), 30] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fc_QCFlag")) # NEEFLAG, Fc_Con_QCFlag
	}
	if (sitename == "GWWNc") {
		PALSt[tctr:(tctr + tsteps - 1), 31] = NA2MissVal(ncvar_get(fid, "GPP_FFNET")) # GPP, GPP_Con
		PALSt[tctr:(tctr + tsteps - 1), 32] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "GPP_FFNET_QCFlag")) # GPPFLAG, same as NEEFlag 
	} else {
		PALSt[tctr:(tctr + tsteps - 1), 31] = NA2MissVal(ncvar_get(fid,'GPP_SOLO')) # GPP, GPP_Con 
		PALSt[tctr:(tctr + tsteps - 1), 32] = OzFluxNc2PALSQCFlag(ncvar_get(fid,'GPP_SOLO_QCFlag')) # GPPFLAG, same as NEEFlag
	}
	PALSt[tctr:(tctr + tsteps - 1), 33] = NA2MissVal(ncvar_get(fid, "Fg")) # G (soil heat flux), Fg_Con (ground heat flux)
	PALSt[tctr:(tctr + tsteps - 1), 34] = OzFluxNc2PALSQCFlag(ncvar_get(fid, "Fg_QCFlag")) # GFLAG, Fg_Con_QCFlag 

	# Increment time step counter
	tctr = tctr + tsteps
	
	# Get OzFlux global attributes:
	datestamp = ncatt_get( fid, varid=0, attname='nc_rundatetime', verbose=FALSE)
	sitepi = ncatt_get( fid, varid=0, attname='site_pi', verbose=FALSE)
	sitecontact = ncatt_get( fid, varid=0, attname='contact', verbose=FALSE)
	licenceurl = ncatt_get( fid, varid=0, attname='license_url', verbose=FALSE)
	licencetype = ncatt_get( fid, varid=0, attname='license_type', verbose=FALSE)
	metadataurl = ncatt_get( fid, varid=0, attname='metadataurl', verbose=FALSE)
	vegetation = ncatt_get( fid, varid=0, attname='vegetation', verbose=FALSE)
	soil = ncatt_get( fid, varid=0, attname='soil', verbose=FALSE)
	timezone = ncatt_get( fid, varid=0, attname='time_zone', verbose=FALSE)
	acknowledgement = ncatt_get( fid, varid=0, attname='acknowledgement', verbose=FALSE)
	nc_close(fid)
}

# Calculate mean temperature
meanT = MeanValue(PALSt, 7)
cat("The average temperature is", meanT, "°C \n")
cat('All data ranges from',PALSt[4,1],'(',PALSt[4,2],') to',PALSt[dim(PALSt)[1],1],'(',PALSt[dim(PALSt)[1],2],') \n')


# Find Missing Values
if (! SaveToLOG) {
	FindMissingValue(PALSt, -9999)
}

# Perform QC for this data set if required:
if (qcScript != "") {
	cat("Calling QC for this dataset... \n")
	source(qcScript)
	PALSt = datasetqc(PALSt, templateVersion = '1.0.2', starttime)
}

# Write csv file:
cat('Writing OzFlux data to PALS template file... \n')
write.csv(as.data.frame(PALSt,optional=TRUE),file=csvfile,
          row.names=FALSE,quote=FALSE)

# Stop writing to the file
if (SaveToLOG) {
	sink()
}

# Create variables needed by ConvertSpreadsheetToNcdf
fileinname = csvfile

# Create met and flux NetCDF files
source(paste0(scriptdir,'FluxTowerConvertSsheetToNcdf.R')) # write NetCDF files

# Add OzFlux meta data to netcdf file:
filenames = c(metfilename,fluxfilename)
for(f in 1:2){
	ncid = nc_open(filenames[f],write=TRUE,readunlim=FALSE)
	ncatt_put(ncid,varid=0,attname='site_PI',attval= sitepi$value)
	ncatt_put(ncid,varid=0,attname='site_contact',attval=sitecontact$value)
	ncatt_put(ncid,varid=0,attname='site_metadata_url',attval=metadataurl$value)
	ncatt_put(ncid,varid=0,attname='OzFlux_vegetation_description',attval=vegetation$value)
	ncatt_put(ncid,varid=0,attname='OzFlux_soil_description',attval=soil$value)
	ncatt_put(ncid,varid=0,attname='time_zone',attval=timezone$value)
	ncatt_put(ncid,varid=0,attname='OzFlux_processing_datetime',attval=datestamp$value)
	ncatt_put(ncid,varid=0,attname='Licence_type',attval=licencetype$value)
	ncatt_put(ncid,varid=0,attname='Licence_URL',attval=licenceurl$value)
	ncatt_put(ncid,varid=0,attname='Acknowledgement',attval=acknowledgement$value)
	nc_close(ncid)
}

# Open graphics device:
QCplotfile = paste0(basedir, "flux_tower/PALS/ObsUpload/OzFlux/", sitename, source,"QCplot.png")
png(filename = QCplotfile, width = 1200, height = 2200, pointsize = 24) # creates empty png file

# Generate and view QC plots:
source(paste0(scriptdir,'QCplotsSpreadsheet.R')) # QC plots
dev.off()
system(paste('open -a Preview.app', QCplotfile))

