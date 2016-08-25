# Variables.R
#
# Functions that define variables
# Gab Abramowitz UNSW 2016 (palshelp at gmail dot com)
#
GetVariableDetails = function(request_names){
	variable_list = list()
	for(v in 1:length(request_names)){
		var_details = list()
		# Dimensional variables
		if(request_names[v] == 'lat'){
			var_details[['Name']] = c('y','lat','latitude','Lat','Latitude')
			var_details[['UnitsName']] = c('degrees_north')
			var_details[['Multiplier']] = c(1)
			var_details[['Addition']] = c(0)
			var_details[['UnitsText']] = ''
			var_details[['PlotName']] = 'Latitude'
			var_details[['Range']] = c(-90,180)
		}else if(request_names[v] == 'lon'){
			var_details[['Name']] = c('x','lon','longitude','Lon','Longitude')
			var_details[['UnitsName']] = c('degrees_east')
			var_details[['Multiplier']] = c(1)
			var_details[['Addition']] = c(0)
			var_details[['UnitsText']] = ''
			var_details[['PlotName']] = 'Longitude'
			var_details[['Range']] = c(-180,360)
		# Met variables
		}else if(request_names[v] == 'SWdown'){
			var_details[['Name']] = c('SWdown')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Downward shortwave radiation'
			var_details[['Range']] = c(0,1360)
		}else if(request_names[v] == 'LWdown'){
			var_details[['Name']] = c('LWdown')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Downward longwave radiation'
			var_details[['Range']] = c(0,750)
		}else if(request_names[v] == 'Tair'){
			var_details[['Name']] = c('Tair')
			var_details[['UnitsName']] = c('K')
			var_details[['Multiplier']] = c(1)
			var_details[['Addition']] = c(0)
			var_details[['UnitsText']] = 'K'
			var_details[['PlotName']] = 'Surface air temperature'
			var_details[['Range']] = c(200,333)
		}else if(request_names[v] == 'Qair'){
			var_details[['Name']] = c('Qair')
			var_details[['UnitsName']] = c('kg/kg','g/g')
			var_details[['Multiplier']] = c(1,1)
			var_details[['Addition']] = c(0,0)
			var_details[['UnitsText']] = 'kg/kg'
			var_details[['PlotName']] = 'Specific humidity'
			var_details[['Range']] = c(0,0.1)
		}else if(request_names[v] == 'PSurf'){
			var_details[['Name']] = c('PSurf')
			var_details[['UnitsName']] = c('Pa','pa','hPa')
			var_details[['Multiplier']] = c(1,1,100) # when using first listed units
			var_details[['Addition']] = c(0,0,0)
			var_details[['UnitsText']] = 'Pa'
			var_details[['PlotName']] = 'Surface air pressure'
			var_details[['Range']] = c(50000,110000) # when using first listed units
		}else if(request_names[v] == 'Rainf'){
			var_details[['Name']] = c('Rainf')
			var_details[['UnitsName']] = c('mm/s','kg/m^2/s', 'kg/m^2s', 'mm/day')
			var_details[['Multiplier']] = c(1,1,1,86400)
			var_details[['Addition']] = c(0,0,0,0)
			var_details[['UnitsText']] = 'mm/s'
			var_details[['PlotName']] = 'Precipitation'
			var_details[['Range']] = c(0,0.05) # when using first listed units
		}else if(request_names[v] == 'Wind'){
			var_details[['Name']] = c('Wind')
			var_details[['UnitsName']] = c('m/s')
			var_details[['Multiplier']] = c(1)
			var_details[['Addition']] = c(0)
			var_details[['UnitsText']] = 'm/s'
			var_details[['PlotName']] = 'Windspeed'
			var_details[['Range']] = c(0,75)
		# Flux variables
		}else if(request_names[v] == 'Qh'){
			var_details[['Name']] = c('Qh','FSH') # FSH->CLM
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Sensible heat flux'
			var_details[['Range']] = c(-1000,1000)
		}else if(request_names[v] == 'Qle'){
			var_details[['Name']] = c('Qle','FCEV') # NB: FCEV is only PART of Qle for CLM
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Latent heat flux'
			var_details[['Range']] = c(-1000,1000)
		}else if(request_names[v] == 'Rnet'){
			var_details[['Name']] = c('Rnet')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Net radiation'
			var_details[['Range']] =  c(-1000,1360)
		}else if(request_names[v] == 'SWnet'){
			var_details[['Name']] = c('SWnet')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Net shortwave radiation'
			var_details[['Range']] =  c(0,1360)
		}else if(request_names[v] == 'LWnet'){
			var_details[['Name']] = c('LWnet')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Net longwave radiation'
			var_details[['Range']] = c(0,750)
		}else if(request_names[v] == 'Qg'){
			var_details[['Name']] = c('Qg')
			var_details[['UnitsName']] = c('W/m2','W/m^2','Wm^{-2}','wm2','watt/m^2')
			var_details[['Multiplier']] = c(1,1,1,1,1)
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = 'W/'~m^{2}
			var_details[['PlotName']] = 'Ground heat flux'
			var_details[['Range']] = c(-1000,1000)
		}else if(request_names[v] == 'NEE'){
			var_details[['Name']] = c('NEE','FCO2') # FCO2->CLM
			var_details[['UnitsName']] = c('umol/m2/s','mumol/m2/s','umol/m^2/s',
				'umol/m2s','gC/m^2/s','gC/m2/s')
			var_details[['Multiplier']] = c(1,1,1,1,1/(1.201E-5),1/(1.201E-5))
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = ~mu~'mol/'~m^{2}~'/s' # default PALS units for plots
			var_details[['PlotName']] = 'Net ecosystem exchange'
			var_details[['Range']] = c(-100,100)
		}else if(request_names[v] == 'GPP'){
			var_details[['Name']] = c('GPP')
			var_details[['UnitsName']] = c('umol/m2/s','mumol/m2/s','umol/m^2/s',
				'umol/m2s','gC/m^2/s','gC/m2/s')
			var_details[['Multiplier']] = c(1,1,1,1,1/(1.201E-5),1/(1.201E-5))
			var_details[['Addition']] = c(0,0,0,0,0)
			var_details[['UnitsText']] = ~mu~'mol/'~m^{2}~'/s' # default PALS units for plots
			var_details[['PlotName']] = 'Gross primary production'
			var_details[['Range']] = c(-100,100)
		}
		variable_list[[v]] = var_details
	}
	return(variable_list)
}
GetVariableIndex = function(vars,varname){
	# Returns the index of a requested variable in a
	# vars variable from a call to GetVariableDetails
	vindex=NA
	for(v in 1:length(vars)){
		if(vars[[v]][['Name']][1] == varname){
			vindex = v
			break
		}
	}
	return(vindex)	
}
