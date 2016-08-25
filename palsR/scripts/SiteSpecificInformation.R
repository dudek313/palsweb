# SiteSpecificInformation.R

# Site specific information for the OzFlux DINGO data set
if(name=='Tumbarumba'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -35.656611
  longitude = 148.151667
  elevation = 1200
  measurementheight = 70
  datasetversion = 1.2
  canopyheight=40
  vegetationtype='Evergreen Broadleaf Forest'
  utcoffset=10
  avprecip=1000
  avtemp=9.47 + 273.15  
}else if(name=='TumbarumbaNc'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/Tumbarumba',sep='')
  latitude = -35.656611
  longitude = 148.151667
  elevation = 1200
  measurementheight = 70
  datasetversion = 1.2
  canopyheight=40
  vegetationtype='Evergreen Broadleaf Forest'
  utcoffset=10
  avprecip=1000
  avtemp=9.55 + 273.15  
}else if(name=='AdelaideRiver'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -13.0769
  longitude = 131.1178
  elevation = 90
  measurementheight = 15
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Savannas'
  utcoffset=9.5
  avprecip=1730
  avtemp=26.95 + 273.15 # 26.80
}else if(name=='AliceSprings'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -22.283
  longitude = 133.249
  elevation = 606
  measurementheight = 11.6
  datasetversion = 1.2
  canopyheight=6.5
  vegetationtype='Open Shrublands'
  utcoffset=9.5
  avprecip=305.9
  avtemp=22.76 + 273.15
}else if(name=='AliceSpringsNc'){
  sitename=name # AliceSpringsMulga
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/AliceSpringsMulga',sep='')
  latitude = -22.283
  longitude = 133.249
  elevation = 606
  measurementheight = 11.6
  datasetversion = 1.2
  canopyheight=6.5
  vegetationtype='Open Shrublands'
  utcoffset=9.5
  avprecip=305.9
  avtemp=22.70 + 273.15
}else if(name=='Calperum'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -34.002712
  longitude = 140.587683
  elevation = NA
  measurementheight = 20
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype="Closed Shrublands"
  utcoffset=9.5
  avprecip=NA
  avtemp=17.92 + 273.15 # 17.83
}else if(name=='Cumberland'){
  sitename=name # Cumberland Plains
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -33.615278
  longitude = 150.723611
  elevation = 200
  measurementheight = 30
  datasetversion = 1.2
  canopyheight=23
  vegetationtype='Woody Savannas'
  utcoffset=10
  avprecip=800
  avtemp=17.52 + 273.15 # (17.03)
}else if(name=='Daintree'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -16.238190
  longitude = 145.427151
  elevation = 86
  measurementheight = NA
  datasetversion = 1.2
  canopyheight=25
  vegetationtype='Evergreen Broadleaf Forest' 
  utcoffset=10
  avprecip=4250
  avtemp=23.49 + 273.15
}else if(name=='DalyPasture'){
  sitename=name # Daly River Pasture
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -14.063333
  longitude = 131.318056
  elevation = 70
  measurementheight = 15
  datasetversion = 1.2
  canopyheight=0.3
  vegetationtype='Savannas'
  utcoffset=9.5
  avprecip=1250
  avtemp=25.27 + 273.15 # 25.35
}else if(name=='DalyRegrowth'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -14.130364
  longitude = 131.382890
  elevation = NA
  measurementheight = NA
  datasetversion = 1.2
  canopyheight= NA
  vegetationtype='Woody Savannas' 
  utcoffset=9.5
  avprecip=NA
  avtemp=26.56 + 273.15 # 26.52
}else if(name=='DalyUncleared'){
  sitename=name # Daly River Uncleared
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -14.1592
  longitude = 131.3881
  elevation = 110
  measurementheight = 23
  datasetversion = 1.2
  canopyheight=16.4
  vegetationtype='Woody Savannas'
  utcoffset=9.5
  avprecip=1170
  avtemp=26.48 + 273.15
}else if(name=='Dargo'){
  sitename=name # Dargo High Plains
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -37.133444
  longitude = 147.170917
  elevation = 1650
  measurementheight = 3
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Closed Shrublands'
  utcoffset=10
  avprecip=NA
  avtemp=6.73 + 273.15
}else if(name=='DryRiver'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -15.258783
  longitude = 132.370567
  elevation = 175
  measurementheight = 25
  datasetversion = 1.2
  canopyheight=12.3
  vegetationtype='Savannas'
  utcoffset=9.5
  avprecip=895.3
  avtemp=26.67 + 273.15 # 26.87
}else if(name=='FoggDam'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -12.545219
  longitude = 131.307183
  elevation = 4
  measurementheight = 15
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Savannas'
  utcoffset=9.5
  avprecip=1411
  avtemp=25.69 + 273.15
}else if(name=='Gingin'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -31.376389
  longitude = 115.713889
  elevation = 51
  measurementheight = 14.8
  datasetversion = 1.2
  canopyheight=7
  vegetationtype='Woody Savannas'
  utcoffset=8
  avprecip= 641
  avtemp=17.32 + 273.15 # 17.78
}else if(name=='GWW'){
  sitename=name # Great Western Woodlands
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -30.1914
  longitude = 120.6542
  elevation = NA
  measurementheight = 35
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Woody Savannas' 
  utcoffset=8
  avprecip=240
  avtemp=19.91 + 273.15
}else if(name=='GWWNc'){
  sitename=name # Great Western Woodlands
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/GreatWesternWoodlands',sep='')
  latitude = -30.1914
  longitude = 120.6542
  elevation = NA
  measurementheight = 35
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Woody Savannas' 
  utcoffset=8
  avprecip=240
  avtemp=19.88 + 273.15
}else if(name=='HowardSprings'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -12.495200
  longitude = 131.150050
  elevation = 64
  measurementheight = 23
  datasetversion = 1.2
  canopyheight=15
  vegetationtype='Savannas'
  utcoffset=9.5
  avprecip=1750
  avtemp=26.69 + 273.15 # 26.68
}else if(name=='Nimmo'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -36.215944
  longitude = 148.552778
  elevation = 1340
  measurementheight = 4
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Grasslands'
  utcoffset=10
  avprecip=NA
  avtemp=7.96 + 273.15
}else if(name=='RDMF'){
  sitename=name # Red Dirt Melon Farm
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -14.560013
  longitude = 132.479933
  elevation = NA
  measurementheight = NA
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Croplands' 
  utcoffset=9.5
  avprecip=NA
  avtemp=26.47 + 273.15
}else if(name=='Riggs'){
  sitename=name # Riggs Creek
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -36.649886
  longitude = 145.575989
  elevation = 152
  measurementheight = 4
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Croplands'
  utcoffset=10
  avprecip=650
  avtemp=15.55 + 273.15
}else if(name=='RobsonCreek'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -17.117469
  longitude = 145.630138
  elevation = 710
  measurementheight = 40
  datasetversion = 1.2
  canopyheight=28
  vegetationtype='Evergreen Broadleaf Forest'
  utcoffset=10
  avprecip=2000
  avtemp=20.71 + 273.15
}else if(name=='Samford'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -27.388056
  longitude = 152.877778
  elevation = NA
  measurementheight = 2
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Grasslands' 
  utcoffset=10
  avprecip=1102
  avtemp=19.09 + 273.15
}else if(name=='SturtPlains'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -17.150689
  longitude = 133.350219
  elevation = 250
  measurementheight = 5
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Grasslands'
  utcoffset=9.5
  avprecip=640
  avtemp=26.01 + 273.15 # 26.05
}else if(name=='TiTree'){
  sitename=name # Ti Tree East
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -22.287
  longitude = 133.640
  elevation = 553
  measurementheight = 10
  datasetversion = 1.2
  canopyheight=4.85
  vegetationtype='Open Shrublands'
  utcoffset=9.5
  avprecip=305.9
  avtemp=24.04 + 273.15
}else if(name=='TiTreeNc'){
  sitename=name # Ti Tree East
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/TiTreeEast',sep='')
  latitude = -22.287
  longitude = 133.640
  elevation = 553
  measurementheight = 10
  datasetversion = 1.2
  canopyheight=4.85
  vegetationtype='Open Shrublands'
  utcoffset=9.5
  avprecip=305.9
  avtemp=24.72 + 273.15
}else if(name=='Wallaby'){
  sitename=name # Wallaby Creek
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -37.426222
  longitude = 145.18725
  elevation = 720
  measurementheight = 5
  datasetversion = 1.2
  canopyheight=75
  vegetationtype='Evergreen Broadleaf Forest'
  utcoffset=10
  avprecip=1209
  avtemp=10.88 + 273.15
}else if(name=='Warra'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -43.095017
  longitude = 146.654517
  elevation = 100
  measurementheight = 80
  datasetversion = 1.2
  canopyheight=55
  vegetationtype='Evergreen Broadleaf Forest' 
  utcoffset=10
  avprecip=1700
  avtemp=10.01 + 273.15
}else if(name=='Whroo'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -36.67305
  longitude = 145.026214
  elevation = 165
  measurementheight = 36
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Woody Savannas'
  utcoffset=10
  avprecip=558
  avtemp=15.82 + 273.15
}else if(name=='Wombat'){
  sitename=name
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -37.422361
  longitude = 144.094194
  elevation = 713
  measurementheight = 30
  datasetversion = 1.2
  canopyheight=25
  vegetationtype='Evergreen Broadleaf Forest'
  utcoffset=10
  avprecip=650
  avtemp=11.40 + 273.15
}else if(name=='Yanco_JAXA'){
  sitename=name # Jaxa
  fluxnetdir = paste(basedir,'flux_tower/OzFlux/DINGO',sep='')
  latitude = -34.987816
  longitude = 146.290757
  elevation = NA
  measurementheight = 8
  datasetversion = 1.2
  canopyheight=NA
  vegetationtype='Grasslands' 
  utcoffset=10
  avprecip=465
  avtemp=17.26 + 273.15 # 16.85
}
