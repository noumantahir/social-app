/* @flow */

 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   ScrollView,
   AsyncStorage,
   ActivityIndicator,
   TouchableWithoutFeedback,
   DeviceEventEmitter,
   Image,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../../utility/PostLinkerService';
 import  * as Values from '../../res/Values';
  import * as Styles from '../../res/Styles';

 import HelperMethods from '../../utility/HelperMethods';
 import CloudinaryHelpers from '../../utility/CloudinaryHelpers';
 import MediaItemVideo from './MediaItemVideo'
 import MediaItemImage from './MediaItemImage'

type Props = {
  mediaItems:any
}

export default class MediaItems extends React.Component<{}>{
  render(){
    const media = this.props.mediaItems;
    return (
      <View >
        {media !== null?
          media.map((mediaItem)=>{

            if(!mediaItem.publicId)
              return;

            const resourceTypeIsImage = mediaItem.resourceType === 'image';
            const viewWidth = Dimensions.get("window").width;
            const viewHeight = viewWidth * (mediaItem.imgHeight / mediaItem.imgWidth)

            const url = resourceTypeIsImage?
              CloudinaryHelpers.getResizedImageUrl(mediaItem.publicId)
              :
              CloudinaryHelpers.getVideoUrl(mediaItem.publicId);

            const source = {uri:url};


            return(
            <View>
            {resourceTypeIsImage?
                <MediaItemImage source={source} viewHeight={viewHeight} viewWidth={viewWidth}/>
                :
                <MediaItemVideo source={source} viewHeight={256} viewWidth={viewWidth} mute={false} paused={false} />

              }
              </View>
            )
          })
          :
          null
        }
        </View>
    )
  }
}
