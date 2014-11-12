setMapHeight();var hash=new L.Hash(map),hashCheck=hash.parseHash(hash),loadParams=getHashParams();if(typeof hashCheck.params!="undefined"){map.setView([hashCheck.params.lat.values,hashCheck.params.lon.values],hashCheck.params.zoom.values)}map.options.maxZoom=12;map.options.minZoom=9;map.options.inertia=false;map.on("moveend",_.debounce(init,650));var layers={MBBase:L.mapbox.tileLayer("cfpb.k55b27gd"),Base:L.mapbox.tileLayer("cfpb.fi6hia4i"),Water:L.mapbox.tileLayer("cfpb.FL_WATER_all_US"),Boundaries:L.mapbox.tileLayer("cfpb.FL_BORDERS_all_US"),CountyLabels:L.mapbox.tileLayer("cfpb.1mkotj4i"),MSALabels:L.mapbox.tileLayer("cfpb.FL_MSA_labels"),PctMinority:L.mapbox.tileLayer("cfpb.FL_TRACT_per-min_US"),PctHispanic:L.mapbox.tileLayer("cfpb.FL_TRACT_per-hsp_US"),PctBlack:L.mapbox.tileLayer("cfpb.FL_TRACT_per-blk_US"),PctAsian:L.mapbox.tileLayer("cfpb.FL_TRACT_per-asn_US"),PctNonWhite:L.mapbox.tileLayer("cfpb.FL_TRACT_pct_nhwht_US"),Centroids:L.layerGroup([])};var baseLayers={"Mapbox Base":layers.MBBase,"Contiguous US":layers.Base};var overlays={Water:layers.Water,Boundaries:layers.Boundaries,"MSA Labels":layers.MSALabels,"Percentage Minority":layers.PctMinority,"Percentage Hispanic":layers.PctHispanic,"Percentage Black":layers.PctBlack,"Percentage Asian":layers.PctAsian,"Percentage Non-white":layers.PctNonWhite,"County Labels":layers.CountyLabels};var minorityLayers=[layers.PctMinority,layers.PctHispanic,layers.PctBlack,layers.PctAsian,layers.PctNonWhite];layers.Base.addTo(map);layers.Water.addTo(map);layers.Boundaries.addTo(map);layers.CountyLabels.addTo(map);layers.Centroids.addTo(map);L.control.layers(baseLayers,overlays,{position:"topleft"}).addTo(map);L.control.scale().addTo(map);layers.Water.bringToFront();layers.Boundaries.bringToFront();layers.CountyLabels.bringToFront();var key=L.control();key.onAdd=function(){return L.DomUtil.get("key")};key.setPosition("topright");key.addTo(map);$(document).ready(function(){$(".tabs").show();$(window).resize(function(){setMapHeight()});$("#category-selector").on("change",function(e){val=$("#category-selector").val();layerUpdate(val)});if(typeof loadParams.category!="undefined"){$("#category-selector").val(loadParams.category.values);layerUpdate(loadParams.category.values)}else{addParam("category","inv_non_hisp_white_only_perc");layerUpdate("inv_non_hisp_white_only_perc")}if(typeof loadParams.action!="undefined"){$("#action-taken-selector").val(loadParams.action.values)}else{addParam("action","all-apps-5")}$("#action-taken-selector").on("change",function(){addParam("action",$("#action-taken-selector option:selected").val());init()});init()});function init(){$.when(getTractsInBounds(getBoundParams()),getTractData(getBoundParams(),getActionTaken($("#action-taken-selector option:selected").val()))).done(function(data1,data2){rawGeo=data1[0];rawData=data2[0];createTractDataObj();redrawCircles(dataStore.tracts);$("#bubbles_loading").hide()})}function setMapHeight(){var viewportHeight=$(window).height();var warningBannerHeight=$("#warning-banner").outerHeight();var headerHeight=$("#header").outerHeight();var mapHeaderHeight=$("#map-header").outerHeight();var mapHeight=viewportHeight-(warningBannerHeight+headerHeight+mapHeaderHeight);$("#map-aside").css("height",mapHeight);$("#map").css("height",mapHeight)}var rawGeo,rawLar,rawMinority,rawData,dataStore={};dataStore.tracts={};function getTractsInBounds(bounds,callback){$("#bubbles_loading").show();var endpoint="/api/tractCentroids/",params={neLat:bounds.neLat,neLon:bounds.neLon,swLat:bounds.swLat,swLon:bounds.swLon};return $.ajax({url:endpoint,data:params,traditional:true,success:console.log("tract Get successful")}).fail(function(status){console.log("no data was available at"+endpoint+". status: "+status)});if(typeof callback==="function"&&callback()){callback}}function getTractData(bounds,actionTakenVal,callback){$("#bubbles_loading").show();var endpoint="/api/all/",params={year:2013,neLat:bounds.neLat,neLon:bounds.neLon,swLat:bounds.swLat,swLon:bounds.swLon};if(urlParam("year")){params.year=urlParam("year")}if(urlParam("lender")){params["lender"]=urlParam("lender")}else{console.log(" Lender parameter is required.");return false}if(actionTakenVal){params["action_taken"]=actionTakenVal}else{console.log("No action taken value - default (1-5) will be used.")}return $.ajax({url:endpoint,data:params,traditional:true,success:console.log("get API All Data request successful")}).fail(function(status){console.log("no data was available at"+endpoint+". status: "+status)});if(typeof callback==="function"&&callback()){callback}}function createTractDataObj(callback){dataStore.tracts={};_.each(rawGeo.features,function(feature,key){var geoid=feature.properties.geoid;dataStore.tracts[geoid]=feature.properties;_.extend(dataStore.tracts[geoid],rawData.minority[geoid]);if(typeof rawData.loanVolume[geoid]!="undefined"){_.extend(dataStore.tracts[geoid],rawData.loanVolume[geoid])}else{dataStore.tracts[geoid].volume=0}});if(typeof callback==="function"&&callback()){callback}}function redrawCircles(geoData){$("#bubbles_loading").show();layers.Centroids.clearLayers();_.each(geoData,function(geo){var bubble=drawCircle(geo)})}function updateCircles(){layers.Centroids.eachLayer(function(layer){layer.setStyle({fillColor:updateMinorityCircleFill(layer.geoid)})});console.log("color update complete.")}function drawCircle(geo){var data=geo,style=minorityContinuousStyle(geo,baseStyle),circle=L.circle([geo.centlat,geo.centlon],hmdaStat(data),style);circle.geoid=geo.geoid;circle.on("mouseover mousemove",function(e){new L.Rrose({offset:new L.Point(0,0),closeButton:false,autoPan:false}).setContent(data["volume"]+" records<br />"+data["num_households"]+" households").setLatLng(e.latlng).openOn(map)});circle.on("mouseout",function(){map.closePopup()});layers.Centroids.addLayer(circle)}var baseStyle={fillOpacity:.9,weight:.5,className:"lar-circle",fillColor:"#333"};var noStyle={stroke:false,weight:0,fill:false};function minorityContinuousStyle(geoProps,baseStyle){return minorityStyle(geoProps,function(minorityPercent,bucket){return(minorityPercent-bucket.lowerBound)/bucket.span},baseStyle)}function minorityStyle(geoProps,percentFn,baseStyle){var geoid=geoProps.geoid,tract=dataStore.tracts[geoid];if(tract["total_pop"]===0||tract.volume===0){return noStyle}else{var perc=minorityPercent(tract),bucket=toBucket(perc),bucketPercent=percentFn(perc,bucket);return $.extend({},baseStyle,{fillColor:colorFromPercent(bucketPercent,bucket.colors)})}}function updateMinorityCircleFill(geoid){var tract=dataStore.tracts[geoid];if(tract["total_pop"]===0||tract.volume===0){return noStyle}else{var perc=minorityPercent(tract),bucket=toBucket(perc),bucketPercent=percentFn(perc,bucket);return colorFromPercent(bucketPercent,bucket.colors)}}function percentFn(minorityPercent,bucket){return(minorityPercent-bucket.lowerBound)/bucket.span}function minorityPercent(tractData){var fieldName=$("#category-selector option:selected").val();if(fieldName.substring(0,4)==="inv_"){return 1-tractData[fieldName.substr(4)]}else{return tractData[fieldName]}}var colorRanges=[{span:.5,lowerBound:0,colors:{lowR:107,lowG:40,lowB:10,highR:250,highG:186,highB:106}},{span:.5,lowerBound:.5,colors:{lowR:124,lowG:198,lowB:186,highR:12,highG:48,highB:97}}];function toBucket(percent){var i,len=colorRanges.length;for(i=0;i<len-1;i++){if(colorRanges[i+1].lowerBound>percent){return colorRanges[i]}}return colorRanges[len-1]}function colorFromPercent(percent,c){var diffR=(c.highR-c.lowR)*percent,diffG=(c.highG-c.lowG)*percent,diffB=(c.highB-c.lowB)*percent;return"rgb("+(c.lowR+diffR).toFixed()+", "+(c.lowG+diffG).toFixed()+", "+(c.lowB+diffB).toFixed()+")"}function hmdaStat(tractData){var $selected=$("#action-taken-selector option:selected"),fieldName=$selected.val(),scale=$selected.data("scale"),area=scale*tractData["volume"];return Math.sqrt(area)}function layerUpdate(layer){if(!layer){console.log("The layer you've requested does not exist.")}for(var i=minorityLayers.length-1;i>=0;i--){map.removeLayer(minorityLayers[i])}switch(layer){case"inv_non_hisp_white_only_perc":layer=layers.PctMinority;break;case"hispanic_perc":layer=layers.PctHispanic;break;case"non_hisp_black_only_perc":layer=layers.PctBlack;break;case"non_hisp_asian_only_perc":layer=layers.PctAsian;break;case"non_hisp_white_only_perc":layer=layers.PctNonWhite;break}map.addLayer(layer);layers.Water.bringToFront();layers.Boundaries.bringToFront();layers.CountyLabels.bringToFront();addParam("category",$("#category-selector option:selected").val());updateCircles()}function urlParam(field){var url=window.location.search.replace("?",""),keyValueStrs=url.split("&"),pairs=_.map(keyValueStrs,function(keyValueStr){return keyValueStr.split("=")}),params=_.reduce(pairs,function(soFar,pair){if(pair.length===2){soFar[pair[0]]=pair[1]}return soFar},{});return params[field]}function getActionTaken(value){var actionTaken;switch(value){case"all-apps-5":actionTaken="1,2,3,4,5";break;case"all-apps-6":actionTaken="1,2,3,4,5,6";break;case"originations-1":actionTaken="1";break}return actionTaken}function getBoundParams(){var bounds=map.getBounds(),padding=0;return{neLat:(bounds._northEast.lat+padding).toFixed(6),neLon:(bounds._northEast.lng+padding).toFixed(6),swLat:(bounds._southWest.lat-padding).toFixed(6),swLon:(bounds._southWest.lng-padding).toFixed(6)}}function getUniques(arr){return _.uniq(arr)}