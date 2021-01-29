/*@flow*/

import * as Values from '../res/Values';
import * as Contract from '../firebase/DatabaseContract';
import HelperMethods from './HelperMethods';
import type {LocationCoordinates} from '../DataTypes'

export type Location = {
  "geometry" : {
             "location" : {
                "lat" : number,
                "lng" : number
             }
          },
          "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/travel_agent-71.png",
          "id" : "21a0b251c9b8392186142c798263e289fe45b4aa",
          "name" : "Rhythmboat Cruises",
          "opening_hours" : {
             "open_now" : true
          },
          "photos" : [
             {
                "height" : 270,
                "html_attributions" : [],
                "photo_reference" : "CnRnAAAAF-LjFR1ZV93eawe1cU_3QNMCNmaGkowY7CnOf-kcNmPhNnPEG9W979jOuJJ1sGr75rhD5hqKzjD8vbMbSsRnq_Ni3ZIGfY6hKWmsOf3qHKJInkm4h55lzvLAXJVc-Rr4kI9O1tmIblblUpg2oqoq8RIQRMQJhFsTr5s9haxQ07EQHxoUO0ICubVFGYfJiMUPor1GnIWb5i8",
                "width" : 519
             }
          ],
          "place_id" : "ChIJyWEHuEmuEmsRm9hTkapTCrk",
          "scope" : "GOOGLE",
          "alt_ids" : [
             {
                "place_id" : "D9iJyWEHuEmuEmsRm9hTkapTCrk",
                "scope" : "APP"
             }
          ],
          "reference" : "CoQBdQAAAFSiijw5-cAV68xdf2O18pKIZ0seJh03u9h9wk_lEdG-cP1dWvp_QGS4SNCBMk_fB06YRsfMrNkINtPez22p5lRIlj5ty_HmcNwcl6GZXbD2RdXsVfLYlQwnZQcnu7ihkjZp_2gk1-fWXql3GQ8-1BEGwgCxG-eaSnIJIBPuIpihEhAY1WYdxPvOWsPnb2-nGb6QGhTipN0lgaLpQTnkcMeAIEvCsSa0Ww",
          "types" : [ "travel_agency", "restaurant", "food", "establishment" ],
          "vicinity" : "Pyrmont Bay Wharf Darling Dr, Sydney"
}

export type AddressComponent = {
  "long_name" : string,
  "short_name" : string,
  "types" : Array<string>
}


export default class GeoHelpers {

  static nearbySearch(locationCoordinates:LocationCoordinates, keyword:string, callback:any, onError:any){
    console.log("fetching places for location: " + JSON.stringify(locationCoordinates));

    const location = locationCoordinates.latitude + ',' + locationCoordinates.longitude;

    const key = Values.Strings.GOOGLE_MAPS_API_KEY;

    const baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

    var fetchUrl = baseUrl + "?location=" + location
      +"&key=" + key;

    fetchUrl += keyword? (
      "&keyword=" + keyword
      +"&rankby=" + "distance"
    ) : (
      "&radius=20000"
    );

    console.log(`Fetching locations for ${fetchUrl}`);
    //example = https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670,151.1957&radius=500&types=food&name=cruise&key=AIzaSyDF8IQG7_S1LaK7N3D2O4I3q-9sCrm7eqY
    HelperMethods.simpleFetch(
      fetchUrl,
      (responseJson)=>{
        if(responseJson.results.length)
          callback(responseJson)
        else{
          //alert("falling back")
          console.log("falling back to text search");
          GeoHelpers.textSearch(keyword, callback, onError)
        }
      },
      (err)=>onError(err))
  }


  static textSearch(query:string, callback:any, onError:any){
    const key = Values.Strings.GOOGLE_MAPS_API_KEY;
    const baseUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";//?query=123+main+street&key=YOUR_API_KEY"

    var fetchUrl = baseUrl + "?query=" + query
      +"&key=" + key;


    console.log(`Fetching locations for ${fetchUrl}`);
    //example = https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670,151.1957&radius=500&types=food&name=cruise&key=AIzaSyDF8IQG7_S1LaK7N3D2O4I3q-9sCrm7eqY
    HelperMethods.simpleFetch(
      fetchUrl,
      (responseJson)=>{callback(responseJson)},
      (err)=>onError(err))
  }


  static async getAddressComponents(locationCoordinates){
    try{
      const key = Values.Strings.GOOGLE_MAPS_API_KEY;
      const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";

      var fetchUrl = `${baseUrl}?latlng=${locationCoordinates.lat},${locationCoordinates.lng}`
        + `&key=${key}`;

      //example: https://maps.googleapis.com/maps/api/geocode/json?latlng=33.668020,72.997978&key=AIzaSyDF8IQG7_S1LaK7N3D2O4I3q-9sCrm7eqY
      const responseJson = await HelperMethods.simpleFetchPromise(fetchUrl)
      if(responseJson.status === "OK")
          return responseJson.results[0].address_components
      else if(responseJson.status === "ZERO_RESULTS")
          return [
            {
               "long_name" : "Other",
               "short_name" : "Other",
               "types" : [ "administrative_area_level_2", "political" ]
            },
            {
               "long_name" : "Other",
               "short_name" : "Other",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "Other",
               "short_name" : "OT",
               "types" : [ "country", "political" ]
            }
          ]

      throw Error("Address compoents not found in response")

    }catch(err){
      console.error("Failed to get address components", err.message);
      throw err
    }
  }


  static getAddressLevels(addressComponents:Array<AddressComponent>){
    var countryCode, level1, level2;

    addressComponents.forEach((component)=>{
      switch (component.types[0]) {
        case "country":
          countryCode = component.short_name
          break;
        case "administrative_area_level_1":
          level1 = component.long_name
          break;

        case "administrative_area_level_2":
          level2 = component.long_name
          break;
        default:

      }
    })

    level1 = level1?level1:"Other"
    level2 = level2?level2:"Other"

    return {countryCode, level1, level2}
  }

  static getCityWithCountryCode(addressComponents:Array<AddressComponent>){
    const {countryCode, level1, level2} = GeoHelpers.getAddressLevels(addressComponents)

    return level2 + (countryCode?`, ${countryCode}`:'')

  }
}
