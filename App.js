/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import type {Node} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

const HomeScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState([]);

  const refreshKillfeed = async () => {
    try {
      const response = await fetch('http://interview.wptdev.com/api/killfeed');
      const json = await response.json();

      if(json.status == "successful") {
        setLatest(json.payload);
        setData(oldData => [...latest, ...oldData]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const renderLatestKill = () => {
    const item = latest[0];

    return item == null ? null :
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Details', {item})}
      >
        <Text style={styles.latestTitleText}>
          {item.source_character}({item.source_player_id}) killed {item.target_character}({item.target_player_id})
        </Text>
        <Text style={styles.latestDescriptionText}>Final Blow: {item.method} for {item.damage} damage</Text>
      </TouchableOpacity>
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshKillfeed();
    }, 3000);

    return () => clearInterval(interval);
  }, [latest]);

  return (
    <View
      style={{
        flex: 1, padding: 5,
        backgroundColor: isDarkMode ? Colors.black : Colors.white,
      }}
    >
      {isLoading ? <View>
          <Text>Waiting for that first one...</Text>
          <ActivityIndicator/>
        </View> :
        <FlatList
          ListHeaderComponent={renderLatestKill()}
          data={data}
          extraData={data}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Details', {item})}
            >
              <Text>
                {item.source_character}({item.source_player_id}) killed {item.target_character}({item.target_player_id})
              </Text>
              <Text>Final Blow: {item.method} for {item.damage} damage</Text>
            </TouchableOpacity>
          )}
        />
      }
    </View>
  );
}

const DetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Kill Details</Text>
      <Text>{item.source_player_id} killed {item.target_player_id}</Text>
      <Text>{item.source_character} killed {item.target_character}</Text>
      <Text>{item.method} for {item.damage} damage</Text>
      <Text>Platform: {item.platform}</Text>
      <Text>Region: {item.region}</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <NavigationContainer style={{flex: 1,}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Stack.Navigator>
        <Stack.Screen name="KillCounter" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 5,
  },
  latestTitleText: {
    fontSize: 25,
    fontWeight: '500',
  },
  latestDescriptionText: {
    fontSize: 20,
  },
});

export default App;
