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
   Text,
   TouchableWithoutFeedback,
   TouchableOpacity,
   View
 } from 'react-native';
 import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import * as Values from '../res/Values';
 import * as Styles from '../res/Styles';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

 export default class MarkerMapScreen extends Component<{}> {

   static navigationOptions = ({ navigation, screenProps }) => {
     return {
       title:"Explore",

       headerRight:
       <TouchableOpacity onPress={()=>{
         navigation.navigate("AdminEvents")
         }}>
         <View style={{marginRight:8}} >
           <MaterialIcons
              name={'event'}
              size={24}
              style={{ color: Values.Colors.COLOR_BLACK }}
           />
         </View>
       </TouchableOpacity>
       ,

     }
   }

   constructor(props){
     super(props)


    this.state = {initialRegionSet:false};
    this.setInitialRegion()

   }

   setInitialRegion(){
     try{
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

         console.log("showing region: " + region);
         this.setState({region})
       });
     }
     catch(err){
       //navigator.geolocation.requestAuthorization()
       alert("No location permission, please enable from settings")
     }
   }

   onRegionChange(region){
     if (!this.state.initialRegionSet) return;
        this.setState({region});
   }

   onMapReady(){
      this.setState({initialRegionSet:true});
   }

   componentDidMount(){
     this.setInitialRegion();
     firebase.database().ref('post').once('value').then((snapshot) => {

       const posts = []
       snapshot.forEach((childSnap) =>{
         var post = childSnap.val();
         post.key = childSnap.key;
         post.type = post.type || "default";
         posts.push(post);
       });

       this.setState({posts})

     });
   }

   getMarkerForPost(post){
     const uid = firebase.auth().currentUser.uid;
     var pinColor = "orange";

     if(post.type === "admin_event"){
       pinColor = "black";
     }else if(post.uid === uid){
       pinColor = "red"
     }

     return (
         <MapView.Marker
           key = {post.key}
           pinColor = {pinColor}
           coordinate={{longitude: post.region.longitude, latitude: post.region.latitude}}
           title={post.title}
           description={post.description}
           onCalloutPress={()=>{
             this.props.navigation.navigate("PostDetails", {postKey:post.key})
           }}
           />
         )
   }


   render(){
     const posts = this.state.posts || [];

     return (
       <View style={styles.container}>

          { this.state.region ?
          <MapView
              style = {styles.map}
              region={this.state.region}
              onRegionChange={(region) => {
                this.onRegionChange(region)}
              }
              onMapReady={()=>{this.onMapReady()}}
              >

              {
                posts.map(post => this.getMarkerForPost(post))
              }

          </MapView>
          :null
        }

          <View style={{position:'absolute', bottom:8, right:8}}>
            <TouchableOpacity onPress={()=>{this.setInitialRegion()}} >
              <View style={{
                borderRadius:18,
                height:36,
                width:36,
                alignItems:'center',
                justifyContent:'center',
                backgroundColor:Values.Colors.COLOR_PRIMARY,
                padding:4,
                overflow:"hidden"
              }}>
                <Ionicons
                 name={'ios-compass'}
                 size={26}
                 style={{ color: Values.Colors.COLOR_WHITE }}
                />
              </View>
            </TouchableOpacity>
          </View>


          <GooglePlacesAutocomplete
                    placeholder='Enter Location'
                    minLength={2}
                    autoFocus={false}
                    returnKeyType={'default'}
                    fetchDetails={true}
                    currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                    currentLocationLabel="Current location"

                    nearbyPlacesAPI='GooglePlacesSearch'
                    GooglePlacesSearchQuery={{
                        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                        rankby: 'distance',
                        types: 'food'
                      }}
                    styles={{
                      container:{
                        position:"absolute",
                        left:16,
                        right:16,
                      },
                      textInputContainer: {
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderTopWidth: 0,
                        borderBottomWidth:0
                      },
                      textInput: {
                        marginLeft: 0,
                        marginRight: 0,
                        height: 38,
                        color: '#5d5d5d',
                        fontSize: 16
                      },
                      predefinedPlacesDescription: {
                        color: '#1faadb'
                      },
                      listView:{
                        backgroundColor:"white"
                      }
                    }}
                    currentLocation={false}
                    onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                      console.log(data, details);
                      this.setState((state)=>{

                        const region = {
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                          latitudeDelta: state.region.latitudeDelta,
                          longitudeDelta: state.region.longitudeDelta,
                      };

                        state.region = region;

                        return state;
                      })
                    }}
                    query={{
                      // available options: https://developers.google.com/places/web-service/autocomplete
                      key: Values.Strings.GOOGLE_MAPS_API_KEY,
                      language: 'en', // language of the results
                      types: '(cities)' // default: 'geocode'
                    }}

                  />




      </View>
    )
  }

 }

 const styles = StyleSheet.create({
   container:{
     flex:1,
   },
   map:{
     position:'relative',
     flex:1,
   },

 });
