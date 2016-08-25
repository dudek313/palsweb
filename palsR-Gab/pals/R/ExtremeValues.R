# PlotExtremeValue.R
#
# Nadja Hegrer, UNSW, 2015, hergernadja at gmail dot com
#

PlotExtremeValue = function(lon,lat,data,range){
  # How to call the function
  # PlotExtremeValue(obs$grid$lon,obs$grid$lat,md$modelm,md$zrange)
  
  # Masks the extreme values and colors them in pink
  library(maps)
  library(mapdata)
  library(fields) # for image.plot
  
  # Choose the color for the extreme values
  zcols = ExtremeValueColour()
  
  # Find values outside of range
  ##ind_extr=which(data < range[1] | data > range[2], arr.ind=TRUE) # ind_extr[,1] -> lon and ind_extr[,2] -> lat
  ind_extr=which(data > range[2], arr.ind=TRUE) # ind_extr[,1] -> lon and ind_extr[,2] -> lat
  
  
  data_na <- data
  data_na[1:length(lon),1:length(lat)] <- NA
  data_na[ind_extr] <- 1
    
  #X11()
  #image.plot(lon,lat,data,zlim=zrange,axes=T)
  image(lon,lat,data_na,col=zcols,axes=T,add=T)
    
}


FindExtremeThreshold = function(data1,data2){
  
  vmin = min(data1,data2,na.rm=TRUE) 
  vmax = max(data1,data2,na.rm=TRUE) 
   
  quant = quantile(c(data1,data2),c(0.98,0.99,0.97),na.rm=TRUE) 
  
  q99to100 = vmax-quant[[2]] 
  q98to99 = quant[[2]]-quant[[1]] 
  
  if(q99to100 > 2*q98to99){
    threshold = c(vmin,quant[[3]])
  }else{
    threshold = c(vmin,vmax)
  }
  
  return(threshold)
}

