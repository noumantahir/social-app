/* @flow */

import React, {Component} from 'react';
import {
  View,
  Button,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';


import * as Values from '../../res/Values';
import * as Styles from '../../res/Styles';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HelperMethods from '../../utility/HelperMethods';

type Props = {
  source:any,
  viewHeight:number,
  viewWidth:number,
  mute:boolean,
  paused:boolean,
}


type State = {
  paused:boolean,
  mute:boolean,
  videoParams:VideoParams|null,
  playedDuration:number,
  totalDuration:number,
}

type Progress = {
  atTimescale:number,
  atValue:number,
  currentTime:number,
  playableDuration:number,
  seekableDuration:number,
  target:number,
}

type VideoParams = {
  canPlayFastForward:boolean,
  canPlayReverse:boolean,
  canPlaySlowForward:boolean,
  canPlaySlowReverse:boolean,
  canStepBackward:boolean,
  canStepForward:boolean,
  currentTime:number,
  duration:number,
  naturalSize:{
    orientation:string,
    width:number,
    height:number,
  },
  target:number
}



export default class MediaItemVideo extends React.Component<Props, State>{
  player:any

  constructor(props:Props){
    super(props)
    const mute = props.mute || false;
    const paused = props.paused || false;
    this.state = {
      paused:paused,
      videoParams:null,
      mute:mute,
      totalDuration:0,
      playedDuration:0,
    }
  }

  componentWillReceiveProps(nextProps:Props){
    const paused = nextProps.paused;
    this.setState({paused})
  }


  getViewSize(){
    const viewWidth = this.props.viewWidth;
    var viewHeight = this.props.viewHeight

    const videoParams = this.state.videoParams;

    if(videoParams){

      const {height, width} = videoParams.naturalSize;
      viewHeight = viewWidth * (height/width)
    }

    return {viewHeight, viewWidth};
  }


  playPauseVideo = () => {
    this.setState((state)=>{
      state.paused = !state.paused
      return state;
    })
  }


  muteUnmuteAudio = () =>{
    this.setState((state)=>{
      state.mute = !state.mute
      return state;
    });
  }


  onLoadStart = (e) =>{
    console.log("started loading video", e);
  }

  onLoad = (videoParams:VideoParams) =>{
    this.setState({videoParams, totalDuration:videoParams.duration});
    console.log("video has loaded", videoParams)
  }

  onProgress = (progress:Progress) => {
    console.log("Progress update received");
    this.setState({playedDuration:progress.currentTime})
  }

  onEnd = (e) => {
    console.log("playback has finished", e)
  }

  onError = (err:any) => {
    console.log("could not load video for some reason",err)
  }

  onBuffer = (e) => {
    console.log("remote is buffering now", e);
  }

  onTimedMetadata = (e) => {
    console.log("remote video meta data received", e);
  }

  renderControls(){
    const {totalDuration, playedDuration} = this.state
    const remainingDuration = Math.floor(totalDuration - playedDuration);

    const formatedDuration = HelperMethods.formatTimeFromSecs(remainingDuration)

    return (
      <View>
        <TouchableWithoutFeedback
          onPress={this.playPauseVideo}>
          <View style={{
              position:'absolute',
              bottom:8,
              left:8,
              width:40,
              height:40,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:Values.Colors.COLOR_TRANSPARENT
            }}>
            <Ionicons
               name={this.state.paused?'ios-play':'ios-pause'}
               size={26}
               style={{
                 color: Values.Colors.COLOR_WHITE
               }}
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={{
            position:'absolute',
            bottom:8,
            right:8,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            backgroundColor:Values.Colors.COLOR_TRANSPARENT
          }}>

          <View >
              <Text style={{color:Values.Colors.COLOR_WHITE}}>{formatedDuration}</Text>
          </View>

          <TouchableWithoutFeedback
            onPress={this.muteUnmuteAudio}>
            <View style={{
                width:40,
                height:40,
                justifyContent:'center',
                alignItems:'center',
              }}>
              <Ionicons
                 name={this.state.mute?'ios-volume-up':'ios-volume-off'}
                 size={26}
                 style={{
                   color: Values.Colors.COLOR_WHITE
                 }}
              />
            </View>
          </TouchableWithoutFeedback>


        </View>
      </View>
  )
  }

  render(){
    const source = this.props.source;
    if(!source) return null;

    const mute = this.state.mute

    const {viewWidth, viewHeight} = this.getViewSize();

    console.log("Videos Props: ", viewWidth, viewHeight, source);

    return (
      <View>
        <Video source={source}   // Can be a URL or a local file.
          ref={(ref) => {this.player = ref}}      // Store reference
          rate={1.0}                              // 0 is paused, 1 is normal.
          volume={mute?0:1}                            // 0 is muted, 1 is normal.
          muted={false}                           // Mutes the audio entirely.
          paused={this.state.paused}                          // Pauses playback entirely.
          resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
          repeat={true}                           // Repeat forever.
          playInBackground={false}                // Audio continues to play when app entering background.
          playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
          ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
          progressUpdateInterval={1000.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
          onLoadStart={this.onLoadStart}            // Callback when video starts to load
          onLoad={this.onLoad}               // Callback when video loads
          onProgress={this.onProgress}               // Callback every ~250ms with currentTime
          onEnd={this.onEnd}                      // Callback when playback finishes
          onError={this.onError}               // Callback when video cannot be loaded
          onBuffer={this.onBuffer}                // Callback when remote video is buffering
          onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata

          style={{
             height:viewHeight,
             width:viewWidth,

             marginTop:8,

             overflow:"hidden",
          }} />

          {this.renderControls()}

        </View>
      )
    }


}
