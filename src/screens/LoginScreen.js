/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  AsyncStorage,
  ActivityIndicator,
  Button,
  Dimensions,
  Alert,
  Image,
  Text,
  View
} from 'react-native';

import * as firebase from 'firebase';
import * as Values from '../res/Values';
import * as Contract from '../firebase/DatabaseContract';
import Swiper from 'react-native-swiper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CloudinaryHelpers from '../utility/CloudinaryHelpers';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import {AccessToken, LoginManager, LoginButton, GraphRequest, GraphRequestManager} from 'react-native-fbsdk'


const KEY_FACEBOOK_ACCESS_TOKEN = "KEY_FACEBOOK_ACCESS_TOKEN";

export default class LoginScreen extends Component<{}> {

  static navigationOptions = {
    header:null
  }

  constructor(props){
    super(props)

    const state = {isWorking:true}
    this.state = state;

    firebase.auth().onAuthStateChanged((user) => {

      if(user){
        firebase.database().ref("ping").once("value")
        .then((snapshot)=>{
          console.log("connection established with database");
          if(user.uid){
            DatabaseHelpers.User.fetchUser(user.uid)
              .then((user:Contract.User)=>{
                this.setState({isWorking:false});
                if(user.accountStatus === Contract.User.ACCOUNT_STATUS_BLOCKED){
                  this.handleBlockedUser()

                }else if(!user.eulaAccepted){
                  this.showEulaDialog()
                    .then((eulaAccepted) => {
                      const values = new Contract.User();
                      values.eulaAccepted = eulaAccepted;
                      DatabaseHelpers.User.updateUser(values)
                      if(eulaAccepted){
                        this.navigateToHome();
                      }
                    })
                    .catch(err=>console.warn(err.message))

                }else{
                  this.navigateToHome();
                }


              }).catch((err)=>{alert(err.message)})
          }

        })
      }else{
        this.setState({isWorking:false});
      }
    });

  }


  navigateToHome(){
    this.props.navigation.navigate("Root")
  }


  componentDidMount(){

    // try {
    //   AsyncStorage.getItem(KEY_FACEBOOK_ACCESS_TOKEN).then((value) => {
    //     if (value !== null){
    //       // We have data!!
    //       console.log(value);
    //       this.processFacebookAccessToken();
    //     }
    //   });
    //
    // } catch (error) {
    //   // Error retrieving data
    // }


  }

  logout(){
    firebase.auth().signOut()
      .then(()=> {
        // Sign-out successful.
        LoginManager.logOut();
      })
      .catch((error)=> {
        // An error happened.
      });
  }

  showEulaDialog(){
    return new Promise((resolve, reject)=>{
      const rejectPress = () => {
        resolve(false)
        this.logout();
      }

      const acceptPress = () => {
        resolve(true)
      }

      Alert.alert(
        Values.Strings.EULA_TITLE,
        Values.Strings.EULA_TEXT,
        [
           {text: 'Reject', onPress: rejectPress, style: 'cancel'},
           {text: 'Accept', onPress: acceptPress, style: 'default'},

        ]
      )
    })

  }

  testLogin(email){
    firebase.auth().signInWithEmailAndPassword(email, "test1234");
    this.setState({isWorking:true});
  }

  handleBlockedUser(){
    this.logout();

    Alert.alert(
      "Blocked!",
      "You have been permanently blocked to access BucketList because of your suspicious activities",
      [],
      {cancelable:false}
    )
  }

  _loginItem(){
    return (
      <View style={{marginBottom:56}}>
        <LoginButton
            readPermissions={['public_profile']}
            onLoginFinished={
              (error, result) => {
                if (error) {
                  alert("Login failed with error: " + result.error);
                  console.log("Login failed with error: " + result.error);
                } else if (result.isCancelled) {
                  console.log("Login was cancelled");
                } else {
                  console.log("Login was successful with permissions: " + result.grantedPermissions)
                  this.setState({isWorking:true});
                  this.processFacebookAccessToken();
                }
              }
            }
            onLogoutFinished={() => console.log("User logged out")}/>
          </View>
        )
  }

  render(){

    const nextButton = (
      <Ionicons
         name={'ios-arrow-forward'}
         size={32}
         style={{ color: Values.Colors.COLOR_WHITE }}
      />
    )
    const prevButton = (
      <Ionicons
         name={'ios-arrow-back'}
         size={32}
         style={{ color: Values.Colors.COLOR_WHITE }}
      />
    )
    return (
      <Swiper
        loop={false}
        showsButtons={true}
        dotColor={Values.Colors.COLOR_LIGHT_GRAY}
        activeDotColor={Values.Colors.COLOR_WHITE}
        nextButton={nextButton}
        prevButton={prevButton}
        >
        <IntroItem
          isWorking={this.state.isWorking}
          text={Values.Strings.INTRO_TEXT_1}
          imgSource={Values.Images.INTRO_1} />
        <IntroItem
          isWorking={this.state.isWorking}
          text={Values.Strings.INTRO_TEXT_2}
          imgSource={Values.Images.INTRO_2} />
        <IntroItem
          isWorking={this.state.isWorking}
          text={Values.Strings.INTRO_TEXT_3}
          imgSource={Values.Images.INTRO_3} />
        <IntroItem
          isWorking={this.state.isWorking}
          loginItem={this._loginItem()}
          imgSource={Values.Images.INTRO_4} />

      </Swiper>
    )
  }

  processFacebookAccessToken(){
    AccessToken.getCurrentAccessToken()
    .then(accessTokenData => {

        const provider = firebase.auth.FacebookAuthProvider;
        const accessToken = accessTokenData.accessToken;

        const credential = provider.credential(accessToken);

        this.setState({fbAccessToken:accessToken})

        firebase.auth().signInWithCredential(credential)
        .then((user) => {
            console.log("Registered User:  " + user.uid);

            var newUser = {
              name:user.displayName,
              photoURL:user.photoURL,
              fbUid:(user.providerData?user.providerData.uid:''),
              tag:user.displayName.toLowerCase(),
              type:"default",
            }


            if(user.providerData){
              const fbUid = user.providerData[0].uid
              if(fbUid)
                newUser.fbUid = fbUid;
                newUser.photoURL = CloudinaryHelpers.getFacebookProfilePicThumb(fbUid)
            }


            firebase.database().ref("user").child(user.uid).once("value")
               .then((snapshot) => {
                  if(snapshot.val() === null){
                    snapshot.ref.set(newUser);
                  }

                })
        })
        .catch((error) => {
          this.setState({isWorking:false});
          console.log("Facebook login failed: " + error.message)
        });
    });
  }
}



class IntroItem extends React.Component<{}>{
  render(){
    const {imgSource, text, loginItem, isWorking} = this.props

    const footer = isWorking?(
      <ActivityIndicator
        style={{margin:32}}
        size='large'
        color={Values.Colors.COLOR_WHITE}
        animating={true} />
      ):(
        <View style={styles.textContainer}>
          <Text style={{color:Values.Colors.COLOR_WHITE}}>{text}</Text>
        </View>
      )
    return (
      <View style={styles.slide}>
        <View style={{position:"absolute", top:0, right:0, left:0, bottom:0}}>
          <Image
            style={{width:"100%", height:"100%"}}
            resizeMode='cover'
            source={imgSource} />
        </View>

        {loginItem? loginItem:footer}

      </View>
    )
  }
}



const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
  },
  textContainer:{
    backgroundColor:Values.Colors.COLOR_BLACK_TRANS,
    marginBottom:32,
    padding:8,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
