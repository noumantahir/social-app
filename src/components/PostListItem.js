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
   Alert,
   Text,
   View
 } from 'react-native';

 import * as Values from '../res/Values';
 import * as Contract from '../firebase/DatabaseContract';
 import CloudinaryHelpers from '../utility/CloudinaryHelpers'
 import HelperMethods from '../utility/HelperMethods';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MapView from 'react-native-maps'
 import * as Styles from '../res/Styles'
 import FastImage from 'react-native-fast-image';
 import MediaItemImage from '../screens/post_details_helpers/MediaItemImage';
 import MediaItemVideo from '../screens/post_details_helpers/MediaItemVideo';
 import PostActionPanel from './PostActionPanel';
 import PostRankBar from './PostRankBar';
 import PostTextHolder from './PostTextHolder';
 import firebase from 'firebase';
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers';

 type Props = {
   onCommentPress:(postKey:string)=>void,
   onPostClick:(postKey:string)=>void,
   post:any,
   hideMoreOptions:boolean,
   isWishlist:boolean,
   isFlagged:boolean
 }

 type State = {
   regionString:string,
   isPaused:boolean,
 }

export default class PostListItem extends Component<Props, State> {

  constructor(props:Props){
    super(props)
    this.state = {regionString:"", isPaused:true}
  }


  renderHeaderComponent(post:Contract.Post){
    const postKey = post.key;
    const currentUserUid = firebase.auth().currentUser.uid;

    const onDeletePostPress = () => {
      console.log('delete post pressed');
      DatabaseHelpers.Post.deletePost(postKey, post.uid)
      DatabaseHelpers.Post.removeFromFlaggedPosts(postKey);
      alert("Post deleted, pull to refresh flagged list");
    }

    const onHidePostPress = () => {
      console.log('hide post pressed');
      DatabaseHelpers.Post.hideFromTimeline(postKey, currentUserUid)
    }

    const onFlagAsInappPress = () => {
      console.log('flag post as inappropriate pressed')
      DatabaseHelpers.Post.addToFlaggedPosts(postKey, post.priority, currentUserUid)
      DatabaseHelpers.Post.hideFromTimeline(postKey, currentUserUid)

    }

    const onRemoveFromFlagged = () =>{
      console.log('remove from flagged posts')
      DatabaseHelpers.Post.removeFromFlaggedPosts(postKey)
      alert("Post removed from flagged, pull to refresh")
    }

    const onMorePress = () => {
      // Works on both iOS and Android
      const buttons = this.props.isFlagged?(
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Unflag Post', onPress:onRemoveFromFlagged},
        ]
      ):(
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Flag as Inappropriate', onPress:onFlagAsInappPress},
          {text: 'Hide From Timeline', onPress:onHidePostPress},
        ]
      )



      if(currentUserUid === post.uid || this.props.isFlagged)
        buttons.push({text: 'Delete Post', onPress:onDeletePostPress})

        Alert.alert(
          'Action Menu',
          'Perform action on selected post',
          buttons,
          { cancelable: false }
        )
    };

    const hideMoreOptions = this.props.hideMoreOptions || false;
    const moreOptionsButton = !hideMoreOptions?(
      <TouchableOpacity onPress={onMorePress} >
        <View style={{paddingLeft:8, width:16, alignItems:'center'}}>
          <Ionicons
             name={'md-more'}
             size={26}
             style={{ color: Values.Colors.COLOR_LIGHT_GRAY }}
          />
        </View>
      </TouchableOpacity>
    ):null

    var regionString = post.regionString || this.state.regionString
    regionString = regionString ? (" " + regionString) : "";

    return(
      <TouchableWithoutFeedback onPress={()=>{this.props.onUserInfoClick(post.uid)}} >
        <View style={styles.itemHeader}>
          <Image style={{height:32, width:32, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}
            resizeMode='contain'
            source={{uri: post.user.photoURL}} borderRadius={16} />
          <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
            <Text style={{fontWeight:'500', fontSize:16}}> {post.user.name || "Bucketlist User"}</Text>
            <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}}>{regionString}</Text>
          </View>

          <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}} >{HelperMethods.getShortTime(post.created_at)}</Text>

          {moreOptionsButton}

        </View>
      </TouchableWithoutFeedback>
    )
  }

  onPostClick = () => {
    const postKey = this.props.post.key;
    this.props.onPostClick(postKey)
  }


  alterPlaybackState = () => {
    this.setState((state)=>{
      state.isPaused = !state.isPaused;
      return state;
    })
  }


  renderMediaElement(mediaArray, postKey){

    if(!mediaArray)
      return null;

    const mediaItem = mediaArray[0] || null;

    if(!mediaItem.publicId)
      return;


    const resourceTypeIsImage = mediaItem.resourceType === 'image';
    const viewWidth = Dimensions.get('window').width;
    const viewHeight = resourceTypeIsImage ?
        mediaItem.imgHeight * (viewWidth / mediaItem.imgWidth)
        :
        9 * (viewWidth / 16)


    const url = resourceTypeIsImage?
      CloudinaryHelpers.getResizedImageUrl(mediaItem.publicId)
      :
      CloudinaryHelpers.getVideoUrl(mediaItem.publicId);

    const source = {uri:url};

    const onPress = () => {
        if(resourceTypeIsImage){
          this.onPostClick()
        }else{
          this.alterPlaybackState()
        }
    }

    return(
      <TouchableWithoutFeedback onPress={onPress}>
        <View>
        {resourceTypeIsImage?
            <MediaItemImage source={source} viewHeight={viewHeight} viewWidth={viewWidth}/>
            :
            <MediaItemVideo source={source} viewHeight={256} viewWidth={viewWidth} mute={false} paused={this.state.isPaused} />
          }
          </View>
        </TouchableWithoutFeedback>
    )
  }


  onCommentPress = () => {
    const {post} = this.props;
    const postKey = post.key;

    this.props.onCommentPress(postKey)
  }

  onLikesPress = () => {
    const {post} = this.props
    const postKey = post.key;
    this.props.onLikesPress(postKey)
  }


render(){
    const post:Contract.Post = this.props.post;



    const region = post.region;
    const addressString = post.addressString;

    if(post.isNull)
      return null;

    if(post.status === Contract.Post.STATUS_SUSPENDED)
      return null;

  return (

          <View style={styles.item} >
              {
                (post.isLoading || false) ?
                <PlaceholderView />
                :
                <View>

                  {this.renderHeaderComponent(post)}
                  {this.renderMediaElement(post.media, post.key)}
                  <PostTextHolder post={post} onPress={this.onPostClick}/>

                  <PostRankBar
                    post={post}
                    isWishlist={this.props.isWishlist}
                    onCommentsPress={this.onCommentPress}
                    onLikesPress={this.onLikesPress}
                    />

                  <PostActionPanel
                    postKey={post.key}
                    isLiked={post.isLiked}
                    isWishlistItem={post.isWishlistItem}
                    onCommentPress={this.onCommentPress}
                    onAddToAchievementsPress={this.props.onAddToAchievementsPress}
                    isWishlist={this.props.isWishlist}
                    />

                </View>
              }

          </View>

    )
}
}


class PlaceholderView extends React.Component<{}>{
  render(){

    return(
      <View style={styles.placeholderContainer}>
        <View style={{flexDirection:'row', flex:1}}>
          <View style={{height:32, width:32, borderRadius:16,
            backgroundColor:Values.Colors.COLOR_BACKGROUND}}/>

          <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
            <View style={{width:250, height:10, backgroundColor:Values.Colors.COLOR_BACKGROUND}}></View>
            <View style={{width:150, height:10, marginTop:8, backgroundColor:Values.Colors.COLOR_BACKGROUND}}></View>
          </View>

          <ActivityIndicator animating={true} />

        </View>

        <View style={{width:'100%', height:128, marginTop:8 , backgroundColor:Values.Colors.COLOR_BACKGROUND}} />
      </View>
    )
  }
}


export class PlaceholderCardView extends React.Component<{}> {
  render(){
    return(

        <View style={styles.item} >
          <PlaceholderView />
        </View>
    )
  }
}


const styles = StyleSheet.create({
  placeholderContainer:{
    flex:1,
    padding:8,
  },
  item:{
    flex:1,
    marginTop:8,
    backgroundColor:'#fff',
    borderTopWidth:StyleSheet.hairlineWidth,
    borderBottomWidth:StyleSheet.hairlineWidth,
    borderColor:Values.Colors.COLOR_LIGHT_GRAY
  },
  itemHeader:{
    flexDirection:'row',
    alignItems:'center',
    flex:1,
    marginTop:8,
    marginLeft:8,
    marginRight:8
  },

  statusLabel:{
    fontWeight:"bold",
    marginTop:16,
  },

  itemTitle:{
    fontWeight:'bold',
    fontSize:18,
  }
})
