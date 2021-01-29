/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   AsyncStorage,
   Picker,
   ScrollView,
   TouchableWithoutFeedback,
   TouchableOpacity,
   ActivityIndicator,
   Image,
   Text,
   NativeModules,
   FlatList,
   DeviceEventEmitter,
   View
 } from 'react-native';

 import * as Styles from '../res/Styles';
 import * as Values from '../res/Values';
 import * as Contract from '../firebase/DatabaseContract'
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers'

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../utility/PostLinkerService';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import NearbyLocationPicker from '../components/new_post_components/NearbyLocationPicker';
import MediaThumb from '../components/new_post_components/MediaThumb';
import GeoHelpers from '../utility/GeoHelpers';
import type {Location} from '../utility/GeoHelpers';
import {NavigationActions} from 'react-navigation';

//import RNCloudinary from 'react-native-cloudinary';
const PRESET_NAME = "test";
const EVENT_PUBLISH_FOR_REVIEW_BTN_PRESS = "EVENT_PUBLISH_FOR_REVIEW_BTN_PRESS";

var CloudinaryManager = NativeModules.CloudinaryManager;

CloudinaryManager.initialize();


type Props = {
  navigation:any,
}

type State = {
  location:Location,
  user:Contract.User,
  description:string,
}


 export default class NewPostScreen extends Component<Props, State> {
   postKey:string

   static navigationOptions = ({ navigation, screenProps }) => {
     return {
       title:"New Achievement",
       headerRight:
       <TouchableOpacity onPress={()=>{
         DeviceEventEmitter.emit(EVENT_PUBLISH_FOR_REVIEW_BTN_PRESS, {})
         }}>
         <View style={{marginRight:8}} >
           <Ionicons
              name={'md-send'}
              size={24}
              style={{ color: Values.Colors.COLOR_PRIMARY }}
           />
         </View>
       </TouchableOpacity>,
       headerLeft:(
         <Button onPress={()=>{navigation.dispatch(NavigationActions.back())}} title={'Cancel'} color={Values.Colors.COLOR_PRIMARY} />
       )
     };
   }

   constructor(props:Props){
     super(props)

     this.state = this.getDefaultState()

     const uid = firebase.auth().currentUser.uid;
     firebase.database().ref("user").child(uid).once('value').then((snapshot)=>{
        const user = snapshot.val();

        this.setState({user})
     })

   }

   getDefaultState(){
     const description = ''
     const title = '';
     const location = null;
     const region = {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

     return {
       region,
       title,
       description,
       location,
       initialRegionSet:false,
       mediaItems:["addButton"],
       categories:[],
       updateMediaListToken:0,
       categoryKey:"general",
       categoryName:"General"
      };
   }

   componentDidMount(){
     this.fetchCategories();
     this.setInitialRegion();
     DeviceEventEmitter.addListener(EVENT_PUBLISH_FOR_REVIEW_BTN_PRESS, ()=>{
       this.publishPost();
     });

     this.initializePostKey();

     const {params} = this.props.navigation.state
     if(params){
       const {description, location} = params;
       if(description)
        this.setState({description})
       if(location)
        this.onLocationSelected(location)
     }
   }

   resetState(){

     this.setState((state)=>{
       state = this.getDefaultState();
       return state;
     });
     this.fetchCategories();
     this.setInitialRegion();

     this.postKey = undefined;
     this.initializePostKey();
   }

   initializePostKey(){
     if(!this.postKey){
       this.postKey = firebase.database().ref().push().key;
     }
   }

   componentWillUnmount(){
     DeviceEventEmitter.removeAllListeners(EVENT_PUBLISH_FOR_REVIEW_BTN_PRESS);
   }


   setInitialRegion(){

     const options = {enableHighAccuracy:true}
     navigator.geolocation.getCurrentPosition((pos)=>{
       console.log(pos);
       const lat = pos.coords.latitude;
       const long = pos.coords.longitude;

       const region = {
         latitude: lat,
         longitude: long,
         latitudeDelta: 0.0922,
         longitudeDelta: 0.0421,
       }

       this.setState({region, postRegion:region});

       this.updateRegionString(region);

     });
   }

   updateRegionString(region){
     if(region){
       const lat = region.latitude;
       const lng = region.longitude;

       const url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
           lat+","+lng+"&key=" + Values.Strings.GOOGLE_MAPS_API_KEY;

       fetch(url)
         .then((response) => response.json())
         .then((responseJson) => {
           const results = responseJson.results;
           if(results){
             this.setState((state)=>{
               const regionString = results[0].formatted_address
               regionStringPrts = regionString.split(", ");
               const prtCount = regionStringPrts.length;
               const addrPrt1 = regionStringPrts[prtCount - 2];
               const addrPrt2 = regionStringPrts[prtCount - 1];

               state.regionString = addrPrt1 ? addrPrt1 + ", " + addrPrt2 : addrPrt2;
               return state;
             })
           }
         })
         .catch((error) => {
           console.error(error);
         });
     }
   }

   onRegionChange(region){
     this.state.postRegion = region;
     if(!this.state.initialRegionSet) return;

      this.setState({region})

      this.updateRegionString(region)
   }

   onMapReady(){
      //this.setInitialRegion()
      this.setState({initialRegionSet:true})
   }

   fetchCategories(){
     firebase.database().ref("category").orderByChild("priority").once('value')
          .then((snapshot)=>{

            var categories = []
            snapshot.forEach((childSnap) =>{

              var category = childSnap.val();

              category.key = childSnap.key;
              categories.push(category);
            });

            this.setState({categories});
          });
   }

   isMediaItemsReady(mediaItems:any){
     for(var i=0; i < mediaItems.length; i++){
       const item = mediaItems[i];
       if(item.status === 'uploading'){
         alert("Please wait while media items are being uploaded");
         return false;
       }else if(item.status === 'failed'){
         alert("Meida upload failed, please remove faulty item or try again later");
         return false;
       }
     }
     return true;
   }

   async publishPost(){
     try{
       const uid = firebase.auth().currentUser.uid
       const {location, description} = this.state;
       const timeInMillis = (new Date()).getTime();

       if(!description){
         alert("Please add a caption before publishing")
         return;
       }else if(!location){
         alert("Please select a location")
         return;
       }

       var mediaItems = Object.assign([],this.state.mediaItems)
       mediaItems.splice(mediaItems.length - 1, 1);

       if(this.isMediaItemsReady(mediaItems)){
         mediaItems = this.cleanMediaItemsForDatabase(mediaItems);
       }else{
         alert("Please wait while media items are being uploaded")
         return;
       }

       const address_components = await GeoHelpers.getAddressComponents(location.geometry.location)

       const postRef = firebase.database().ref("post").child(this.postKey);
       var postData = new Contract.Post();

       postData.region = this.state.postRegion;
       postData.title = this.state.title;
       postData.tag = this.state.title.toLowerCase();
       postData.description = this.state.description;
       postData.created_at = timeInMillis;
       postData.priority = -timeInMillis;
       postData.categoryKey = this.state.categoryKey || "general";
       postData.categoryName = this.state.categoryName || "General";
       postData.status = "pending";
       postData.type = "default";
       postData.uid = uid;
       postData.user = this.state.user;
       postData.regionString = this.state.location.name;
       postData.location = this.state.location;
       postData.points = 1;
       postData.media = mediaItems;
       postData.address_components = address_components

       postRef.set(postData)
       postRef.once('value').then((snapshot)=>{
         this.processLinkers(postRef.key, postData)
       })
       .catch((e) => {
         console.log(e);
       });
     }
     catch(err){
       alert(`Failed to publish post, please try again. ${err.message}`)
       console.error("Failed to publish post", err.message);
     }
   }



   async processLinkers(postKey, postData){
     console.log("post published");

     PostLinkerService.linkPost(postKey, postData.priority)
     DatabaseHelpers.User.updateUserStats(postData, postKey)

     this.resetState();
     this.props.navigation.goBack(null)
   }



   cleanMediaItemsForDatabase(items:any){
     const length = items.length;

     //set publicIds and start upload routines
     for(var i = 0; i < length; i++){
       delete items[i].uri;
       delete items[i].filename;
       delete items[i].key;
     }

     return items;
   }

   uploadMediaItem(pos:number, item:any){
     //set publicIds and start upload routines

       const index = pos;
       const uri =  item.uri;
       const resourceType = item.resourceType;
       const publicId = this.postKey + "_media_" + index;

       item.publicId = publicId;
       item.status = "uploading";

      CloudinaryManager.uploadMedia(uri, publicId, resourceType)
        .then(data => {
           console.log("uploaded image data: " + JSON.stringify(data));
           item.status = "ready";
           item.url = data.url;
           item.resourceType = data.resourceType;
           this.updateMediaItem(index, item);
         })
         .catch(err => {
           console.log("errror upload iamge: " + err);
           item.status = "failed";
           this.updateMediaItem(index, item);
         });

      return item;
   }

   updateMediaItem(index:number, item:any){
     this.setState((state)=>{
       const curItem = state.mediaItems[index];
       if(curItem){
         if(curItem.uri === item.uri){
           state.mediaItems[index] = item;
           state.updateMediaListToken = (item.status + index)
         }
       }

       return state;

     })
   }

   showMediaPicker(){
        var ImagePicker = require('react-native-image-picker');

        // More info on all the options is below in the README...just some common use cases shown here
        var options = {
          title: 'Select Image/Video',
          mediaType: 'mixed',

          storageOptions: {
            skipBackup: true,
          }
        };

        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info below in README)
         */
        ImagePicker.showImagePicker(options, (response) => {
          console.log('Response = ', response);

          if (response.didCancel) {
            console.log('User cancelled image picker');
          }
          else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          }

          else {
            // You can also display the image using data:
            // let source = { uri: 'data:image/jpeg;base64,' + response.data };
            var mediaItems = this.state.mediaItems;
            const len = mediaItems.length;
            const pos = len - 1;

            var resourceType = "image";
            if(response.fileName){
              resourceType = response.fileName.match(/.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/) ?
                  "image" : "video";
            }else{
              resourceType = response.uri.match(/.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/) ?
                  "image" : "video";
            }

            const item = {
                  uri:response.uri,
                  imgWidth:response.width || 0,
                  imgHeight:response.height || 0,
                  filename:response.fileName,
                  resourceType:resourceType,
                  key:response.uri
                };

            const mediaItem = this.uploadMediaItem(pos, item);

            mediaItems.splice(pos, 0, mediaItem);
            const token = mediaItem.status + pos
            this.setState({mediaItems, updateMediaListToken:token});

          }
        });
   }

   removeMediaItem(index){
     this.setState((state)=>{
       state.mediaItems.splice(index, 1);
       state.updateMediaListToken = "removal" + index
       return state;
     })
   }


   onLocationSelected = (location) => {
     const postRegion = this.state.region;
     if(location){
       postRegion.latitude = location.geometry.location.lat;
       postRegion.longitude = location.geometry.location.lng;
     }

     this.setState({location, postRegion})
   }

   render(){
     const region = this.state.region;
     const curLocation = {longitude:region.longitude, latitude:region.latitude}

     return (
       <KeyboardAwareScrollView style={Styles.background.baseGround}>



          <View style={{margin:8}}>

          {
          // <Text style={Styles.textInput.label} >Add Title</Text>
          // <TextInput
          // style={Styles.textInput.grayBorderedSingleLine}
          // onChangeText={(text) => this.setState({title:text})}
          // value={this.state.title}
          // />
          }

          <FlatList style={{marginTop:8}} horizontal={true} data={this.state.mediaItems}
            extraData={this.state.updateMediaListToken}
            renderItem={({item, index})=>{

              const viewHeight = 128;
              const viewWidth = viewHeight * (item.imgWidth/item.imgHeight)
              return (

                <View style={{margin:8, height:viewHeight, alignItems:"center", justifyContent:'center'}}>
                    {item !== "addButton"?
                    <MediaThumb viewHeight={viewHeight} item={item} onRemoveItem={()=>{this.removeMediaItem(index)}} />
                    :
                    <TouchableOpacity onPress={()=>{this.showMediaPicker()}}>
                      <View style={{height:viewHeight, width:viewHeight, borderWidth:1,
                         borderRadius:8, borderColor:Values.Colors.COLOR_LIGHT_GRAY,
                         backgroundColor:"white",
                         alignItems:"center",
                         justifyContent:"center"
                       }}>
                        <Image style={{
                          height:56,
                          width:56,
                          }}
                          resizeMode="contain"
                          tintColor={Values.Colors.COLOR_LIGHT_GRAY}
                          source={require("../res/drawables/ic_add_media.png")}
                         />
                      </View>
                    </TouchableOpacity>
                  }
              </View>
            );
          }} />


          <View style={{margin:8}} >
            <TextInput
              style={Styles.textInput.grayBorderedMultiLine}
              multiline = {true}
              numberOfLines = {5}
              onChangeText={(text) => this.setState({description:text})}
              value={this.state.description}
              placeholder="Add a Caption"/>

          </View>


          <NearbyLocationPicker
            currentLocationCoords={curLocation}
            onLocationSelected={this.onLocationSelected}
            selectedLocation={this.state.location}
            />




          {
          // <Text style={Styles.textInput.label}>Select Category</Text>
          // <View >
          //   <CategoryPicker categories={this.state.categories} onSelection={(item)=>{
          //     console.log("category selected: " + JSON.stringify(item))
          //     this.state.categoryKey = item.key
          //     this.state.categoryName = item.name;
          //   }} />
          // </View>
          }

          </View>

          {
          // <GooglePlacesAutocomplete
          //           placeholder='Enter Location'
          //           minLength={2}
          //           autoFocus={false}
          //           returnKeyType={'default'}
          //           fetchDetails={true}
          //           currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
          //           currentLocationLabel="Current location"
          //
          //           nearbyPlacesAPI='GooglePlacesSearch'
          //           GooglePlacesSearchQuery={{
          //               // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          //               rankby: 'distance',
          //               types: 'food'
          //             }}
          //           styles={{
          //             container:{
          //               position:"absolute",
          //               left:16,
          //               right:16,
          //             },
          //             textInputContainer: {
          //               backgroundColor: 'rgba(0,0,0,0)',
          //               borderTopWidth: 0,
          //               borderBottomWidth:0
          //             },
          //             textInput: {
          //               marginLeft: 0,
          //               marginRight: 0,
          //               height: 38,
          //               color: '#5d5d5d',
          //               fontSize: 16
          //             },
          //             predefinedPlacesDescription: {
          //               color: '#1faadb'
          //             },
          //             listView:{
          //               backgroundColor:"white"
          //             }
          //           }}
          //           currentLocation={false}
          //           onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          //             console.log(data, details);
          //             this.setState((state)=>{
          //
          //               const region = {
          //                 latitude: details.geometry.location.lat,
          //                 longitude: details.geometry.location.lng,
          //                 latitudeDelta: state.region.latitudeDelta,
          //                 longitudeDelta: state.region.longitudeDelta,
          //             };
          //
          //               state.region = region;
          //
          //               return state;
          //             })
          //           }}
          //           query={{
          //             // available options: https://developers.google.com/places/web-service/autocomplete
          //             key: 'AIzaSyDF8IQG7_S1LaK7N3D2O4I3q-9sCrm7eqY',
          //             language: 'en', // language of the results
          //             types: '(cities)' // default: 'geocode'
          //           }}
          //
          //         />
                }




        </KeyboardAwareScrollView>
     )
   }


 }


 const POINTER_SIZE = 24
 const POINTER_SIZE_HALF = (POINTER_SIZE/2);
 const MAP_HEIGHT = Values.Dimens.NEW_POST_MAP_HEIGHT;

 const POINTER_POS_LEFT = (Dimensions.get('window').width/2) - POINTER_SIZE_HALF
 const POINTER_POS_TOP = (MAP_HEIGHT / 2)  - POINTER_SIZE_HALF;

 const styles = StyleSheet.create({
   container:{
     flex:1,
   },
   map:{
     width:Dimensions.get('window').width,
     height:MAP_HEIGHT,
   },
   pointer:{
     width:POINTER_SIZE,
     height:POINTER_SIZE,
     top:POINTER_POS_TOP,
     left:POINTER_POS_LEFT,
     position:'absolute',
   },


 });
