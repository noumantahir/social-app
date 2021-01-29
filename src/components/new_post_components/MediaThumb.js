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

 import * as Styles from '../../res/Styles';
 import * as Values from '../../res/Values';
 import * as Contract from '../../firebase/DatabaseContract'
 import * as DatabaseHelpers from '../../firebase/DatabaseHelpers'

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../../utility/PostLinkerService';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

 export default class MediaThumb extends Component<{}>{

   render(){
     const item = this.props.item;
     const statusLabel = item.status === 'uploading' ?
        "Uploading...":"Ready";
     const viewHeight = this.props.viewHeight;
     const loadImage = item.resourceType === 'image';
     return (
       <View style={{
         overflow:'hidden',
         borderRadius:8,
         borderColor:Values.Colors.COLOR_LIGHT_GRAY,
         width:viewHeight,
         height:viewHeight,
      }}>
       {loadImage?
         <FastImage resizeMode={FastImage.resizeMode.cover} style={{
            height:viewHeight,
            width:viewHeight,
            borderRadius:8,
            borderColor:Values.Colors.COLOR_LIGHT_GRAY,
            borderWidth:1,
            overflow:"hidden",
         }} source={{uri:item.uri}}/>
         :
         <Video source={{uri: item.uri}}   // Can be a URL or a local file.
             ref={(ref) => {
               this.player = ref
             }}                             a         // Store reference
             rate={1.0}                              // 0 is paused, 1 is normal.
             volume={1.0}                            // 0 is muted, 1 is normal.
             muted={true}                           // Mutes the audio entirely.
             paused={false}                          // Pauses playback entirely.
             resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
             repeat={true}                           // Repeat forever.
             playInBackground={false}                // Audio continues to play when app entering background.
             playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
             ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
             progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
             onLoadStart={()=>{}}            // Callback when video starts to load
              onLoad={()=>{}}               // Callback when video loads
              onProgress={()=>{}}               // Callback every ~250ms with currentTime
              onEnd={()=>{}}                      // Callback when playback finishes
              onError={()=>{}}               // Callback when video cannot be loaded
              onBuffer={()=>{}}                // Callback when remote video is buffering
              onTimedMetadata={()=>{}}  // Callback when the stream receive some metadata

             style={{
                height:viewHeight,
                width:viewHeight,
                borderRadius:8,
                borderColor:Values.Colors.COLOR_LIGHT_GRAY,
                borderWidth:1,
                overflow:"hidden",
             }} />
       }

       <View style={{position:'absolute',
                      bottom:0,
                      left:0,
                      right:0,
                      backgroundColor:Values.Colors.COLOR_BLACK,
                      alignItems:'center',
                      justifyContent:'center'
                    }}>

          <Text style={{
            color:Values.Colors.COLOR_WHITE,
            fontWeight:"600"
          }}>
          {statusLabel}
          </Text>
       </View>

       <View style={{position:'absolute',
                      top:8,
                      left:8,
                      backgroundColor:Values.Colors.COLOR_TRANSPARENT
                    }}>

          {
            item.status === 'uploading' ?
            <ActivityIndicator animating={true} color={Values.Colors.COLOR_BLACK}/>:null
          }


       </View>

       <View style={{position:'absolute',
                      top:0,
                      right:0,
                      backgroundColor:Values.Colors.COLOR_TRANSPARENT
                    }}>
          <TouchableOpacity onPress={()=>{this.props.onRemoveItem()}} >
              <View style={{padding:8}} >
                <Text>X</Text>
              </View>
          </TouchableOpacity>

       </View>

       </View>
     )
   }
 }
