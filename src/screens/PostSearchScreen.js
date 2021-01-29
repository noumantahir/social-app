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
   TouchableWithoutFeedback,
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import * as Values from '../res/Values';
 import * as Styles from '../res/Styles';
 import PostListItem from '../components/PostListItem';

 export default class PostSearchScreen extends Component<{}> {

   static navigationOptions = ({navigation}) => {
     return {
       title:"Search",
       headerRight:<Button title="Users" onPress={()=>{navigation.navigate("UserSearch")}} />,
     }
   }

   constructor(props){
     super(props);
     this.state = {isLoading:false, searchQuery:""};
   }

   componentDidMount(){

   }

   searchPosts(){
     this.setState({isLoading:true, posts:[]});
     const searchQuery = this.state.searchQuery;

     firebase.database().ref("post").orderByChild("tag").startAt(searchQuery)
          .endAt(searchQuery+"\uf8ff").once('value')
          .then((snapshot)=>{

            var posts = []
            snapshot.forEach((childSnap) =>{

              var post = childSnap.val();

              post.key = childSnap.key;
              posts.splice(0,0,post);

            });

            this.setState({posts, isLoading:false});

          });
   }

   _renderItem = ({item}) => {

        return (
          <PostListItem post={item} onPostClick={(key)=>{this.onPostClick(key)}} />

        )
   };

   onPostClick(postKey){
      this.props.navigation.navigate("PostDetails", {postKey})
   }

   _renderHeader = ()=>{
     return(
       <View>
         <View style={Styles.background.card} >
            <TextInput
              style={{
                width:Dimensions.get('window').width,

              }}
              numberOfLines = {4}
              placeholder="Enter Query"
              onChangeText={(text)=>{
                this.state.searchQuery = text.toLowerCase()
                this.searchPosts();
              }}
              />
            </View>
         </View>
     )
   }

   _renderFooter = () => {
     return (
        <View>
          {this.state.isLoading ? <ActivityIndicator style={{margin:16}} animating={true} /> : null}
        </View>
      )
   }


   render(){
     var posts = this.state.posts || []
     return (

       <View style={{flex:1}}>
       <FlatList
          data={posts}
          renderItem={this._renderItem}
          ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
        />
       </View>
     )
   }
 }

 const styles = StyleSheet.create({
   item:{
     flex:1,
     borderColor:'gray',
     borderWidth:1,
     borderRadius:8,
     margin:8,
     padding:8,
     backgroundColor:'#fff'
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
