/**
@flow
**/
import React, {Component} from 'react'

import {
  StyleSheet,
  Text,
  FlatList,
  Image,
  View,
} from 'react-native'

import * as Values from '../../res/Values';
import * as Styles from '../../res/Styles';
import Separator from '../../components/Separator';
import * as firebase from 'firebase';
import * as DatabaseHelpers from '../../firebase/DatabaseHelpers';

type Props = {
  targetUid:string
}
type State = {
  countriesVisited:number,
  citiesVisited:number
}

export default class StatsHeaderItem extends React.Component<Props, State> {

  constructor(props:Props){
    super(props);
    this.state = {countriesVisited:0, citiesVisited:0}
    this.fetchVisitCounts();
  }

  fetchVisitCounts(){
    const targetUid = this.props.targetUid || "";
    if(targetUid){
    DatabaseHelpers.UserData.fetchVisitCounts(targetUid)
      .then((counts)=>{
        if(counts){
          this.setState({
            countriesVisited:counts.countries || 0,
            citiesVisited:counts.cities || 0
          })
        }
      })
      .catch((err)=>{
        //console.error(err)
      })
    }
  }

  _renderStatsItem(label:string, count:number){
    return (
      <View style={styles.statsItem}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    )
  }

  render(){
    const {countriesVisited, citiesVisited} = this.state;
    return (
      <View style={[Styles.background.card, styles.cardOverlay]}>
        {this._renderStatsItem("Countries Visited", countriesVisited)}
        <Separator orientation={Separator.ORIENTATION_VERTICAL} />
        {this._renderStatsItem("Cities Visited", citiesVisited)}
      </View>
    )
  }

}

const styles = StyleSheet.create({
  cardOverlay:{
    flexDirection:'row',
    flex:1,
  },
  statsItem:{
    flex:1,
    alignItems:'center'
  },
  label:{

  },
  count:{
    fontSize:26,
    fontWeight:'bold',
    color:Values.Colors.COLOR_PRIMARY
  }

})
