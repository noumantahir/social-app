/*@flow*/

import React, {Component} from 'react';
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
  FlatList,
  Image,
  Text,
  NativeModules,
  DeviceEventEmitter,
  View

} from 'react-native'

import * as Values from '../../res/Values';
import * as Styles from '../../res/Styles';
import GeoHelpers from '../../utility/GeoHelpers';
import Separator from '../Separator';
import Ionicons from 'react-native-vector-icons/Ionicons';


import type {LocationCoordinates} from '../../DataTypes';

type Props = {
  currentLocationCoords:LocationCoordinates,
  onLocationSelected:(location:any)=>void
}
type State = {locations:Array<Location>}

export default class NearbyLocationPicker extends React.Component<Props, State>{

  constructor(props:Props){
    super(props);
    this.state = {locations:[], selectedLocation:this.props.selectedLocation}
  }

  componentDidMount(){
    this.fetchNearbyLocations(this.props.currentLocationCoords);

  }

  componentWillReceiveProps(nextProps:Props){
    this.fetchNearbyLocations(nextProps.currentLocationCoords)
    this.setState({selectedLocation:nextProps.selectedLocation})
  }


  fetchNearbyLocations(location:LocationCoordinates, keyword:string = ''){
    if(location.latitude && location.longitude){

      GeoHelpers.nearbySearch(location, keyword, (response:any)=>{
          const locations = response.results;
          console.log(JSON.stringify(locations, null, '\t'))
          if(locations){
            this.setState({locations})
          }else{
            this.setState({locations:[]})
          }
        });
    }
  }

  _renderLocationItem = (info) => {
    const location = info.item;

    const onPress = () =>{
      this.props.onLocationSelected(location);
      this.setState({selectedLocation:location})
    }
    //alert(location)
    return (
      <TouchableOpacity onPress={onPress} >
        <View>
          <View style={{padding:8}}>
            <Text style={{fontWeight:'600'}}>{location.name}</Text>
            <Text>{location.formatted_address || location.vicinity}</Text>
          </View>
          <Separator orientation={Separator.ORIENTATION_HORIZONTAL}  />
        </View>
      </TouchableOpacity>
    )
  }


  _renderHeader(){
    const {selectedLocation} = this.state

    const onResetPress = () => {
      this.props.onLocationSelected(null)
      this.setState({selectedLocation:null})
    }

    const onChangeText = (text) => {
      this.fetchNearbyLocations(this.props.currentLocationCoords,text)
    }

    return selectedLocation?(
      <TouchableOpacity onPress={onResetPress} >
        <View style={{flexDirection:'row', alignItems:'center'}} >
          <Ionicons
             name={'ios-pin'}
             size={32}
             style={{color: Values.Colors.COLOR_GRAY,padding:4 }}
          />
          <View style={{padding:8, flex:1}}>
            <Text style={{fontWeight:'600'}}>{selectedLocation.name}</Text>
            <Text>{selectedLocation.formatted_address || selectedLocation.vicinity}</Text>
          </View>

          <Ionicons
             name={'ios-close'}
             size={32}
             style={{color: Values.Colors.COLOR_BLACK,padding:4 }}
          />

        </View>
      </TouchableOpacity>
    ):(
      <View style={{padding:8}}>
        <TextInput
          onChangeText={onChangeText}
          placeholder='Search Location'
          />
      </View>
    )
  }


  render(){
    const state = this.state;
    const {selectedLocation} = state

    return (
      <View style={Styles.background.card}>
        {this._renderHeader()}
        {!selectedLocation?
          <View>
            <Separator orientation={Separator.ORIENTATION_HORIZONTAL} />
            <FlatList
              data={state.locations}
              extraData={state}
              renderItem={this._renderLocationItem}
              />
          </View>
          :
          null
        }
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:Values.Colors.COLOR_BLUE
  }
})
