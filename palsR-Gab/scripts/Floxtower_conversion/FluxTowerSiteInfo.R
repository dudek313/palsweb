# FluxTowerSiteInfo.R

	# Site specific information for the OzFlux data sets
	if(sitename=='Tumbarumba'){
	  latitude = -35.656611
	  longitude = 148.151667
	  elevation = 1200
	  measurementheight = 70
	  canopyheight=40
	  vegetationtype='Evergreen Broadleaf Forest'
	  utcoffset=10
	  avprecip=1000
	  avtemp=9.47 + zeroC  
	}else if(sitename=='AdelaideRiver'){
	  latitude = -13.0769
	  longitude = 131.1178
	  elevation = 90
	  measurementheight = 15
	  canopyheight=NA
	  vegetationtype='Savanna'
	  utcoffset=9.5
	  avprecip=1730
	  avtemp=26.95 + zeroC 
	}else if(sitename=='AliceSprings'){
	  latitude = -22.283
	  longitude = 133.249
	  elevation = 606
	  measurementheight = 11.6
	  canopyheight=6.5
	  vegetationtype='Open Shrubland'
	  utcoffset=9.5
	  avprecip=305.9
	  avtemp=22.76 + zeroC 
	}else if(sitename=='Calperum'){
	  latitude = -34.002712
	  longitude = 140.587683
	  elevation = NA
	  measurementheight = 20
	  canopyheight=NA
	  vegetationtype="Closed Shrubland"
	  utcoffset=9.5
	  avprecip=NA
	  avtemp=17.92 + zeroC 
	}else if(sitename=='CapeTribulation'){
	  latitude = -16.103172
	  longitude = 145.447016
	  elevation = 66
	  measurementheight = 45
	  canopyheight= 25
	  vegetationtype= 'Evergreen Broadleaf'
	  utcoffset= 10
	  avprecip= 5200
	  avtemp= 23 + zeroC
	}else if(sitename=='CowBay'){
	  latitude = -16.23819
	  longitude = 145.427151
	  elevation = 86
	  measurementheight = 35
	  canopyheight= 25
	  vegetationtype= 'Evergreen Broadleaf'
	  utcoffset= 10
	  avprecip= 4250
	  avtemp= 23 + zeroC   
	}else if(sitename=='CumberlandPlains'){
	  latitude = -33.615278
	  longitude = 150.723611
	  elevation = 200
	  measurementheight = 30
	  canopyheight=23
	  vegetationtype='Woody Savanna'
	  utcoffset=10
	  avprecip=800
	  avtemp=17.52 + zeroC 
	}else if(sitename=='Daintree'){
	  latitude = -16.238190
	  longitude = 145.427151
	  elevation = 86
	  measurementheight = NA
	  canopyheight=25
	  vegetationtype='Evergreen Broadleaf Forest' 
	  utcoffset=10
	  avprecip=4250
	  avtemp=23.49 + zeroC 
	}else if(sitename=='DalyPasture'){
	  latitude = -14.063333
	  longitude = 131.318056
	  elevation = 70
	  measurementheight = 15
	  canopyheight=0.3
	  vegetationtype='Savanna'
	  utcoffset=9.5
	  avprecip=1250
	  avtemp=25.27 + zeroC 
	}else if(sitename=='DalyRegrowth'){
	  latitude = -14.130364
	  longitude = 131.382890
	  elevation = NA
	  measurementheight = NA
	  canopyheight= NA
	  vegetationtype='Woody Savanna' 
	  utcoffset=9.5
	  avprecip=NA
	  avtemp=26.56 + zeroC 
	}else if(sitename=='DalyUncleared'){
	  latitude = -14.1592
	  longitude = 131.3881
	  elevation = 110
	  measurementheight = 23
	  canopyheight=16.4
	  vegetationtype='Woody Savanna'
	  utcoffset=9.5
	  avprecip=1170
	  avtemp=26.48 + zeroC 
	}else if(sitename=='Dargo'){
	  latitude = -37.133444
	  longitude = 147.170917
	  elevation = 1650
	  measurementheight = 3
	  canopyheight=NA
	  vegetationtype='Closed Shrubland'
	  utcoffset=10
	  avprecip=NA
	  avtemp=6.73 + zeroC 
	}else if(sitename=='DryRiver'){
	  latitude = -15.258783
	  longitude = 132.370567
	  elevation = 175
	  measurementheight = 25
	  canopyheight=12.3
	  vegetationtype='Savanna'
	  utcoffset=9.5
	  avprecip=895.3
	  avtemp=26.67 + zeroC 
	}else if(sitename=='Emerald'){
	  latitude = -23.8587
	  longitude = 148.4746 
	  elevation = 170
	  measurementheight = 5
	  canopyheight = 1
	  avprecip=572
	  vegetationtype='Crop'
	  utcoffset = 10
	  avtemp = 21.5+ zeroC
	}else if(sitename=='FoggDam'){
	  latitude = -12.545219
	  longitude = 131.307183
	  elevation = 4
	  measurementheight = 15
	  canopyheight=NA
	  vegetationtype='Savanna'
	  utcoffset=9.5
	  avprecip=1411
	  avtemp=25.69 + zeroC 
	}else if(sitename=='Gingin'){
	  latitude = -31.376389
	  longitude = 115.713889
	  elevation = 51
	  measurementheight = 14.8
	  canopyheight=7
	  vegetationtype='Woody Savanna'
	  utcoffset=8
	  avprecip= 641
	  avtemp=17.32 + zeroC 
	}else if(sitename=='GreatWesternWoodlands'){
	  latitude = -30.1914
	  longitude = 120.6542
	  elevation = NA
	  measurementheight = 35
	  canopyheight=NA
	  vegetationtype='Woody Savanna' 
	  utcoffset=8
	  avprecip=240
	  avtemp=19.91 + zeroC 
	}else if(sitename=='HowardSprings'){
	  latitude = -12.495200
	  longitude = 131.150050
	  elevation = 64
	  measurementheight = 23
	  canopyheight=15
	  vegetationtype='Savanna'
	  utcoffset=9.5
	  avprecip=1750
	  avtemp=26.69 + zeroC 
	}else if(sitename=='Nimmo'){
	  latitude = -36.215944
	  longitude = 148.552778
	  elevation = 1340
	  measurementheight = 4
	  canopyheight=NA
	  vegetationtype='Grassland'
	  utcoffset=10
	  avprecip=NA
	  avtemp=7.96 + zeroC 
	}else if(sitename=='Otway'){  
	  latitude = -38.517
	  longitude = 142.8
	  elevation = 54
	  measurementheight = 5
	  canopyheight=NA
	  vegetationtype='Grassland'
	  utcoffset=10
	  avprecip=800
	  avtemp=12.9 + zeroC 
	}else if(sitename=='RedDirtMelonFarm'){
	  latitude = -14.560013
	  longitude = 132.479933
	  elevation = NA
	  measurementheight = NA
	  canopyheight=NA
	  vegetationtype='Cropland' 
	  utcoffset=9.5
	  avprecip=NA
	  avtemp=26.47 + zeroC 
	}else if(sitename=='RiggsCreek'){
	  latitude = -36.649886
	  longitude = 145.575989
	  elevation = 152
	  measurementheight = 4
	  canopyheight=NA
	  vegetationtype='Cropland'
	  utcoffset=10
	  avprecip=650
	  avtemp=15.55 + zeroC 
	}else if(sitename=='RobsonCreek'){
	  latitude = -17.117469
	  longitude = 145.630138
	  elevation = 710
	  measurementheight = 40
	  canopyheight=28
	  vegetationtype='Evergreen Broadleaf Forest'
	  utcoffset=10
	  avprecip=2000
	  avtemp=20.71 + zeroC 
	}else if(sitename=='Samford'){
	  latitude = -27.388056
	  longitude = 152.877778
	  elevation = NA
	  measurementheight = 2
	  canopyheight=NA
	  vegetationtype='Grassland' 
	  utcoffset=10
	  avprecip=1102
	  avtemp=19.09 + zeroC 
	}else if(sitename=='SturtPlains'){
	  latitude = -17.150689
	  longitude = 133.350219
	  elevation = 250
	  measurementheight = 5
	  canopyheight=NA
	  vegetationtype='Grassland'
	  utcoffset=9.5
	  avprecip=640
	  avtemp=26.01 + zeroC 
	}else if(sitename=='TiTree'){
	  latitude = -22.287
	  longitude = 133.640
	  elevation = 553
	  measurementheight = 10
	  canopyheight=4.85
	  vegetationtype='Open Shrubland'
	  utcoffset=9.5
	  avprecip=305.9
	  avtemp=24.04 + zeroC 
	}else if(sitename=='Wallaby'){
	  latitude = -37.426222
	  longitude = 145.18725
	  elevation = 720
	  measurementheight = 5
	  canopyheight=75
	  vegetationtype='Evergreen Broadleaf Forest'
	  utcoffset=10
	  avprecip=1209
	  avtemp=10.88 + zeroC
	}else if(sitename=='Warra'){
	  latitude = -43.095017
	  longitude = 146.654517
	  elevation = 100
	  measurementheight = 80
	  canopyheight=55
	  vegetationtype='Evergreen Broadleaf Forest' 
	  utcoffset=10
	  avprecip=1700
	  avtemp=10.01 + zeroC
	}else if(sitename=='Whroo'){
	  latitude = -36.67305
	  longitude = 145.026214
	  elevation = 165
	  measurementheight = 36
	  canopyheight=NA
	  vegetationtype='Woody Savanna'
	  utcoffset=10
	  avprecip=558
	  avtemp=15.82 + zeroC
	}else if(sitename=='WombatStateForest'){
	  latitude = -37.422361
	  longitude = 144.094194
	  elevation = 713
	  measurementheight = 30
	  canopyheight=25
	  vegetationtype='Evergreen Broadleaf Forest'
	  utcoffset=10
	  avprecip=650
	  avtemp=11.40 + zeroC
	}else if(sitename=='Yanco'){
	  latitude = -34.987816
	  longitude = 146.290757
	  elevation = NA
	  measurementheight = 8
	  canopyheight=NA
	  vegetationtype='Grassland' 
	  utcoffset=10
	  avprecip=465
	  avtemp=17.26 + zeroC # 16.85
	}
	