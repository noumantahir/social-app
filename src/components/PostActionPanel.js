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
   FlatList,
   Image,
   TouchableWithoutFeedback,
   TouchableOpacity,
   AsyncStorage,
   ActivityIndicator,
   DeviceEventEmitter,
   Text,
   View
 } from 'react-native';

 import firebase from 'firebase'
 import * as Values from '../res/Values'
 import * as Contract from '../firebase/DatabaseContract'
 import CloudinaryHelpers from '../utility/CloudinaryHelpers'
 import HelpersMethods from '../utility/HelperMethods';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MapView from 'react-native-maps'
 import * as Styles from '../res/Styles'
 import FastImage from 'react-native-fast-image';
 import MediaItemImage from '../screens/post_details_helpers/MediaItemImage';
 import MediaItemVideo from '../screens/post_details_helpers/MediaItemVideo';


 import * as DatabaseHelpers from '../firebase/DatabaseHelpers';

 //import geocoder from 'react-native-geocoder';
 type Props = {
   postKey:string,
   isLiked:boolean,
   isWishlistItem:boolean,
   user:Contract.User,
   post:Contract.Post,
   onCommentPress:()=>void,
   onAddToAchievementsPress:()=>void,
 }

 type State = {
   isLiked:boolean,
   isWishlistItem:boolean,
 }

 type PanelButtonProps = {
   onPress:()=>void,
   title:string,
   color:string,
   iconName:string,
 }

export default class PostActionPanel extends Component<Props, State> {
  uid:string;

  constructor(props:Props){
    super(props)
    this.uid = firebase.auth().currentUser.uid;
    this.state = {isLiked:props.isLiked, isWishlistItem:props.isWishlistItem}
  }

  componentDidMount(){
    //check if post is liked
  }

  componentWillUpdateProps(props:Props){

    this.setState({isLiked:props.isLiked})
  }


  onLikePress = () => {
    const isLiked = !this.state.isLiked;
    const postKey = this.props.postKey;
    const uid = this.uid;

    DatabaseHelpers.PostData.updateLikeStatus(postKey, uid, isLiked)
    this.setState({isLiked})

    //emit event for updating post
    DeviceEventEmitter.emit(Values.Strings.EVENT_FETCH_UPDATED_POST, {postKey})
  }

  onSavePress = () => {
     const uid = this.uid;
     var postKey = this.props.postKey;
     this.setState({isWishlistItem:true})

     const onStatus = (status) => {
       DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_WISHLIST, {})
     }

     DatabaseHelpers.UserData.addPostToWishlist(uid, postKey, onStatus);
  }



  _renderDefaultActionPanel(){
    const likeBtnColor = this.state.isLiked ?
      Values.Colors.COLOR_PRIMARY:Values.Colors.COLOR_DARKER_GRAY

    const saveButtonColor = this.state.isWishlistItem ?
      Values.Colors.COLOR_PRIMARY:Values.Colors.COLOR_DARKER_GRAY

    return(
      <View style={styles.container} >
        <PanelButton
          title="Like"
          color={likeBtnColor}
          iconName="ios-heart"
          onPress={this.onLikePress}
          />

        <PanelButton
          title="Comment"
          color={Values.Colors.COLOR_DARKER_GRAY}
          iconName='ios-chatboxes'
          onPress={this.props.onCommentPress}
          />

        <PanelButton
          title="To Wishlist"
          color={saveButtonColor}
          iconName='ios-bookmark'
          onPress={this.onSavePress}
          />
      </View>
    )
  }


  _renderWishlistActionPanel(){
    const onRemovePress = () => {
      const postKey = this.props.postKey
      const uid = firebase.auth().currentUser.uid;
      DatabaseHelpers.UserData.removePostFromWishlist(uid, postKey)
    }

    return (
      <View style={styles.container} >
        <PanelButton
          title="Remove"
          color={Values.Colors.COLOR_DARKER_GRAY}
          iconName="md-close-circle"
          onPress={onRemovePress}
          />

        <PanelButton
          title="Add to Achievements"
          color={Values.Colors.COLOR_DARKER_GRAY}
          iconName='md-add-circle'
          onPress={this.props.onAddToAchievementsPress}
          />
      </View>
    )
  }



  render(){
    if(this.props.isWishlist){
      return this._renderWishlistActionPanel()
    }

    else {
      return this._renderDefaultActionPanel()

    }
  }

}


class PanelButton extends React.Component<PanelButtonProps, *>{
  render(){
    const {title, color, onPress, iconName} = this.props;
    return(
      <TouchableOpacity onPress={onPress}>
      <View style={styles.panelButtonContainer}>
        <Ionicons
          name={iconName}
          size={20}
          style={{
            color:color
          }}
        />
        <Button
          title={title}
          color={color}
          onPress={onPress}/>
      </View>
      </TouchableOpacity>
    )
  }
}

const styles = {
  container:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-around'
  },
  panelButtonContainer:{
    flexDirection:'row',
    alignItems:'center'
  },
}
