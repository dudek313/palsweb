# UnitsChange.R
#
# functions for units changes. zeroC is in Constants.R
#
# Gab Abramowitz UNSW 2014 (palshelp at gmail dot com)

Rel2SpecHum = function(relHum,tk,PSurf){
	# Converts relative humidity to specific humidity.
	# tk - T in Kelvin; PSurf in Pa; relHum as %
	tempC = tk - zeroC
	# Sat vapour pressure in Pa
	esat = 610.78*exp( 17.27*tempC / (tempC + 237.3) )
	# Then specific humidity at saturation:
	ws = 0.622*esat/(PSurf - esat)
	# Then specific humidity:
	specHum = (relHum/100) * ws
	
	return(specHum)
}

Spec2RelHum = function(specHum,tk,PSurf){
	# Converts relative humidity to specific humidity.
	# tk - T in Kelvin; PSurf in Pa; relHum as %
	tempC = tk - zeroC
	# Sat vapour pressure in Pa
	esat = 610.78*exp( 17.27*tempC / (tempC + 237.3) )
	# Then specific humidity at saturation:
	ws = 0.622*esat/(PSurf - esat)
	# Then relative humidity:
	relHum = pmax(pmin(specHum/ws*100, 100),0)
	
	return(relHum)
}

Mbar2Pa = function(PSurf_mbar){
	# Converts air pressure in mbar to pa
	PSurf_pa = PSurf_mbar * 100
	return(PSurf_pa)
}

Abs2SpecHum = function(absHum,tk,PSurf){
  # Converts absolute humidity to specific humidity.
  # From http://www.vaisala.com/Vaisala%20Documents/Application%20notes/Humidity_Conversion_Formulas_B210973EN-F.pdf
  # absHum in g/m3, tempC in °C, PSurf in Pa
  const = 2.16679 # gK/J
  tempC = tk - zeroC
  # Calculate the vapor pressure (pw) in Pa:
  pw = absHum * tk / const
  # Calculate saturation vapour pressure (pws) in Pa:
  pws = 610.78 * exp( 17.27*tempC / (tempC + 237.3) )
  # Calculate specific humidity at saturation (ws), PSurf in Pa:
  ws = 0.622 * pws / (PSurf - pws)
  # Calculate relative humidity (relHum):
  relHum = (pw / pws) * 100
  relHum[relHum > 100] = 100 # correction
  relHum[relHum < 0] = 0 # correction
  # Then specific humidity in kg/kg:
  specHum = (relHum/100) * ws
  return(specHum)
}