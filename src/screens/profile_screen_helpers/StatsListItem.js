/**
@flow
**/
import React, {Component} from 'react'

import {
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  View,
} from 'react-native'

import * as Values from '../../res/Values';
import * as Styles from '../../res/Styles';
import FastImage from 'react-native-fast-image';

export default class StatsListItem extends React.Component<{}> {

  renderTrophyItem = ()=>{
    return  (<View style={{width:16, height:16, marginLeft:8, borderRadius:16, backgroundColor:Values.Colors.COLOR_BLUE_600}} />)
  }


  onCityPress(cityItem){
    this.props.onCityPress(cityItem)
  }

  renderCities(level2Data:any){
    var data = []

    for(const key in level2Data){
      if(level2Data.hasOwnProperty(key)){
        const item = level2Data[key];
        item.key = key;
        data.push(item);
      }
    }



    return (
      <FlatList horizontal={true} data={data} renderItem={({item})=>{
        const imgSource = item.thumbUrl? {uri:item.thumbUrl}:Values.Images.IC_CITY_PLACEHOLDER
        return (
          <TouchableOpacity onPress={()=>{this.onCityPress(item)}} >
            <View>
                <View style={{
                  width:92,
                  height:92,
                  marginRight:8,
                  borderRadius:16,
                  borderWidth:1,
                  borderColor:Values.Colors.COLOR_LIGHT_GRAY,
                  overflow:'hidden',
                  alignItems:"flex-end",
                  justifyContent:'center',
                  flexDirection:'row'
                }}>

                <View style={{position:'absolute'}} >
                  <FastImage style={{
                      width:92,
                      height:92,
                      backgroundColor:Values.Colors.COLOR_LIGHT_GRAY
                    }} borderRadius={4} source={imgSource} />
                </View>

                <View style={{
                  backgroundColor:Values.Colors.COLOR_BLACK_TRANS,
                  marginBottom:16,
                  paddingLeft:4,
                  paddingTop:2,
                  paddingBottom:2,
                  flex:1,
                }}>
                  <Text style={{
                    color:Values.Colors.COLOR_WHITE
                  }}>{item.key}</Text>
                </View>

                </View>
            </View>
          </TouchableOpacity>
        )
      }} />
    )
  }

  render(){
      const {statsItem} = this.props
      const level1Name = statsItem.key;
      const level2Data = statsItem.level2;
      const totalPosts = statsItem.totalPosts

      return (
        <View style={Styles.background.card}>

          <View style={{
              flexDirection:'row',
              flex:1,
              marginBottom:8
            }}>
            <Text style={{flex:1}}>{level1Name}</Text>
            <Text>{totalPosts}</Text>
          </View>


          <View style={{flexDirection:'row', alignItems:'center'}} >
            {
              this.renderCities(level2Data)
            }
          </View>

        </View>
      )
  }

}

const styles = StyleSheet.create({
  card:{
    flex:1,
    borderColor:Values.Colors.COLOR_LIGHT_GRAY,
    borderWidth:1,
    borderRadius:Values.Dimens.CARD_BORDER_RADIUS,
    marginTop:Values.Dimens.CARD_TOP_MARGIN,
    marginLeft:Values.Dimens.CARD_SIDE_MARGIN,
    marginRight:Values.Dimens.CARD_SIDE_MARGIN,
    padding:Values.Dimens.CARD_INNER_PADDING,
    backgroundColor:'#fff'
  },

  statusLabel:{
    fontWeight:"600",
    marginTop:14,
  },

  itemTitle:{
    fontWeight:'600',
    fontSize:16,
  }
})
