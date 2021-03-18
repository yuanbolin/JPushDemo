/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
  NativeModules,
  Alert,
} from 'react-native';
import {Dimensions} from 'react-native';
import JPush from 'jpush-react-native';
import {checkNotifications} from 'react-native-permissions';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

// const server = 'http://58.59.70.10:8100';
const server = 'http://192.168.1.184:8100';

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      status: 0, //未进行任何操作的状态值
      info: {},
    };
  }

  componentDidMount() {
    this.jpush();
    this.getInfo();
    this.time = setInterval(this.getInfo, 3000);
    checkNotifications().then(({status, settings}) => {
      if (status == 'blocked') {
        Alert.alert(
          '检测到通知权限未打开',
          '会影响异常报警时的通知,请前往开启通知权限',
          [
            {
              text: '去设置',
              onPress: () => {
                NativeModules.OpenSettings.openNetworkSettings(data => {
                  console.log('call back data', data);
                });
              },
            },
          ],
        );
      } else if (status == 'granted') {
        console.log('通知权限已经打开', settings);
      }
    });
  }

  componentWillUnmount() {
    this.time && clearInterval(this.time);
    this.time2 && clearInterval(this.time2);
  }

  //jpush
  jpush = () => {
    // JPush.setLoggerEnable(true);
    JPush.init();
    //获取id
    this.RegistrationID = result => {
      let DeviceID = JSON.stringify(result);
      DeviceID = DeviceID.split('"')[1] + '';
      this.setState(
        {
          DeviceID,
        },
        () => {
          this.ispolice();
        },
      );
    };
    JPush.getRegistrationID(this.RegistrationID);
    //连接状态
    this.connectListener = result => {
      console.log('connectListener:' + JSON.stringify(result));
    };
    JPush.addConnectEventListener(this.connectListener);
    //通知回调
    this.notificationListener = result => {
      console.log('notificationListener:' + JSON.stringify(result));
    };
    JPush.addNotificationListener(this.notificationListener);
    //本地通知回调
    this.localNotificationListener = result => {
      console.log('localNotificationListener:' + JSON.stringify(result));
    };
    JPush.addLocalNotificationListener(this.localNotificationListener);
    //自定义消息回调
    this.customMessageListener = result => {
      console.log('customMessageListener:' + JSON.stringify(result));
    };
    JPush.addCustomMessagegListener(this.customMessageListener);
    //tag alias事件回调
    this.tagAliasListener = result => {
      console.log('tagAliasListener:' + JSON.stringify(result));
    };
    JPush.addTagAliasListener(this.tagAliasListener);
    //手机号码事件回调
    this.mobileNumberListener = result => {
      console.log('mobileNumberListener:' + JSON.stringify(result));
    };
    JPush.addMobileNumberListener(this.mobileNumberListener);
  };

  ispolice = () => {
    let {DeviceID} = this.state;
    JPush.resumePush();
    JPush.setAlias({sequence: 200, alias: DeviceID});
    fetch(server + `/api/cashier/ispolice?equipmentNo=${DeviceID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('发送成功', responseJson);
      })
      .catch(error => {
        ToastAndroid.show('网络异常', ToastAndroid.SHORT);
      })
      .finally(() => {
        this.time2 && clearInterval(this.time2);
        this.time2 = setTimeout(() => {
          this.ispolice();
        }, 300000);
      });
  };

  getInfo = () => {
    fetch(server + '/api/cashier/getInfo', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        if (responseJson.success && responseJson.obj) {
          this.setState({info: responseJson.obj[0]});
        }
      })
      .catch(error => {
        console.log(error);
        ToastAndroid.show('网络异常', ToastAndroid.SHORT);
      });
  };

  sendOneStatus = () => {
    fetch(server + '/api/cashier/start', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        if (responseJson.success) {
          ToastAndroid.show('开启成功', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(responseJson.msg, ToastAndroid.SHORT);
        }
      })
      .catch(error => {
        ToastAndroid.show('网络异常', ToastAndroid.SHORT);
        console.log(error);
      });
  };

  sendTowStatus = () => {
    fetch(server + '/api/cashier/stop ', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        if (responseJson.success) {
          ToastAndroid.show('关闭成功', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(responseJson.msg, ToastAndroid.SHORT);
        }
      })
      .catch(error => {
        ToastAndroid.show('网络异常', ToastAndroid.SHORT);
        console.log(error);
      });
  };

  render() {
    const {
      ipressure,
      ipressureAlarm,
      p1Status,
      pressureTime,
      pumpTime,
    } = this.state.info;
    let show_ipressure = '',
      show_ipressureAlarm = '',
      show_p1Status = '',
      show_pressuretime = '',
      show_pumptime = '';
    if (ipressure) {
      show_ipressure = ipressure + ' Mpa';
    }
    if (ipressureAlarm) {
      show_ipressureAlarm = ipressureAlarm === '1' ? '报警' : '正常';
    }
    if (p1Status) {
      show_p1Status = p1Status === '1' ? '打开' : '关闭';
    }
    if (pressureTime) {
      show_pressuretime = pressureTime;
    }
    if (pumpTime) {
      show_pumptime = pumpTime;
    }

    return (
      <View>
        <View style={styles.top}>
          <Text style={styles.wordStyle}>阀门控制</Text>
        </View>

        <ImageBackground
          source={require('./image/330495-14022Q1461353.jpg')}
          style={styles.imageStyle}>
          <View style={styles.info_box}>
            <Text style={styles.label}>
              阀门状态：<Text style={styles.info}>{show_p1Status}</Text>
            </Text>
            <Text style={styles.label}>
              压力值：<Text style={styles.info}>{show_ipressure}</Text>
            </Text>

            <Text style={styles.label}>
              压力报警： <Text style={styles.info}>{show_ipressureAlarm}</Text>
            </Text>

            <Text style={styles.label}>
              阀门状态采集时间：<Text style={styles.info}>{show_pumptime}</Text>
            </Text>

            <Text style={styles.label}>
              压力采集时间：<Text style={styles.info}>{show_pressuretime}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.sendOneStatus()}>
            <Text style={styles.wordTowStyle}> 开启阀门</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonTow}
            onPress={() => this.sendTowStatus()}>
            <Text style={styles.wordThreeStyle}> 关闭阀门</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  info_box: {
    marginTop: 10,
    marginLeft: 10,
  },
  label: {
    fontSize: 18,
    color: '#ccc',
  },
  info: {
    fontSize: 20,
    color: '#FFA500',
  },
  top: {
    width: width,
    backgroundColor: 'skyblue',
    height: 50,
  },
  wordStyle: {
    fontSize: 20,
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 9,
  },
  imageStyle: {
    width: width,
    height: height - 50,
  },
  button: {
    width: 200,
    height: 50,
    backgroundColor: 'skyblue',
    borderRadius: 5,
    marginTop: 130,
    marginLeft: 150,
  },
  wordTowStyle: {
    fontSize: 20,
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 9,
  },
  buttonTow: {
    width: 200,
    height: 50,
    backgroundColor: 'skyblue',
    borderRadius: 5,
    marginLeft: 150,
    marginTop: 80,
  },
  wordThreeStyle: {
    fontSize: 20,
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 9,
  },
});
