import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

function DashboardScreen({ data, setData, topItems, setTopItems, revenue, setRevenue, salesLog, setSalesLog, currentBar }) {
  const LOW_STOCK_THRESHOLD = 20;

  useEffect(() => {
    const fetchMenu = async () => {
      const menuRef = collection(db, 'bars', currentBar, 'menu');
      const snapshot = await getDocs(menuRef);
      const menuItems = snapshot.docs.map(doc => {
        const item = doc.data();
        return {
          id: doc.id,
          ...item,
          price: Number(item.price),
          sales: Number(item.sales),
          inventory: Number(item.inventory)
        };
      });
      setData(menuItems);
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const salesInterval = setInterval(() => {
      const updates = [];
      let totalSold = 0;
      setData(prevData => {
        const updated = prevData.map(item => {
          const sold = Math.random() < 0.3 && item.inventory > 0 ? 1 : 0;
          if (sold) {
            updates.push(`✅ Sold 1x ${item.name}`);
            totalSold += item.price;
          }
          return {
            ...item,
            sales: item.sales + sold,
            inventory: item.inventory - sold
          };
        });
        if (updates.length > 0) {
          setSalesLog(prev => [...updates, ...prev.slice(0, 19)]);
          setRevenue(prev => prev + totalSold);
        }
        return updated;
      });
    }, 3000);
    return () => clearInterval(salesInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Array.isArray(data) && data.length > 0) {
        setTopItems([...data].sort((a, b) => b.sales - a.sales).slice(0, 3));
        console.log('🔍 Top Items:', data.slice(0, 3));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>Top Sellers:</Text>
        {Array.isArray(topItems) && topItems.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.sales}>Sold: {item.sales}</Text>
          </View>
        ))}

        <Text style={[styles.text, { marginTop: 20 }]}>Inventory Tracker</Text>
        {Array.isArray(data) && data.map(item => {
          const isHot = topItems.some(top => top.id === item.id);
          const tag = isHot ? '🔥 HOT' : item.sales === 0 ? '❄️ COLD' : null;
          return (
            <View key={item.id} style={styles.card}>
              <Text style={[styles.itemName, item.inventory < LOW_STOCK_THRESHOLD && { color: 'red' }]}> 
                {item.name} {tag && <Text style={styles.tag}>{tag}</Text>}
              </Text>
              <Text style={styles.inventory}>Stock: {item.inventory}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, {
                  width: `${Math.min(100, (item.inventory / 150) * 100)}%`,
                  backgroundColor: item.inventory < LOW_STOCK_THRESHOLD ? 'red' : '#00BFFF'
                }]} />
              </View>
            </View>
          );
        })}

        <Text style={[styles.text, { marginTop: 20 }]}>💵 Revenue: ${revenue.toFixed(2)}</Text>

        <View style={{ marginVertical: 20 }}>
          <Text onPress={async () => {
            const par = 120;
            const lines = data.map(i => {
              const needed = par - i.inventory;
              return needed > 0 ? `${i.name},${i.inventory},${needed}` : null;
            }).filter(Boolean);

            const csv = ['Item,Current Stock,Order Needed', ...lines].join('\n');
            const fileUri = FileSystem.documentDirectory + 'requisition_sheet.csv';
            await FileSystem.writeAsStringAsync(fileUri, csv);
            await Sharing.shareAsync(fileUri);
            setHistoryLog(prev => [`📁 Downloaded: ${new Date().toLocaleString()}`, ...prev]);

            const message = ['📦 Requisition Sheet:', ...lines.map(line => `• ${line.replace(/,/g, ' → ')}`)];
            setSalesLog(prev => [...message, ...prev.slice(0, 20 - message.length)]);
          }}
            style={{ color: '#00BFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
            📋 Create Requisition Sheet
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function SalesScreen({ salesLog }) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>Live Sales Feed</Text>
        {Array.isArray(salesLog) && salesLog.map((log, index) => (
          <Text key={index} style={styles.salesLog}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

function HistoryScreen({ logs }) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>📁 Download History</Text>
        {logs.map((entry, index) => (
          <Text key={index} style={styles.salesLog}>{entry}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
const BarTabs = createMaterialTopTabNavigator();
import { Ionicons } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();

import { SafeAreaView } from 'react-native-safe-area-context';

function BarTabsNavigator({ currentBar }) {
  const [salesLog, setSalesLog] = useState([]);
  const [data, setData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenue, setRevenue] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <BarTabs.Navigator
  screenOptions={{
    tabBarStyle: {
      backgroundColor: '#1E1E1E'
    },
    tabBarLabelStyle: {
      color: '#00BFFF',
      fontWeight: 'bold'
    },
    tabBarIndicatorStyle: {
      backgroundColor: '#00BFFF'
    }
  }}>

      <BarTabs.Screen name="Dashboard">
        {() => (
          <DashboardScreen
            data={data}
            setData={setData}
            topItems={topItems}
            setTopItems={setTopItems}
            revenue={revenue}
            setRevenue={setRevenue}
            salesLog={salesLog}
            setSalesLog={setSalesLog}
            currentBar={currentBar}
          />
        )}
      </BarTabs.Screen>
      <BarTabs.Screen name="Sales Feed">
        {() => <SalesScreen salesLog={salesLog} />}
      </BarTabs.Screen>
    </BarTabs.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  const [historyLog, setHistoryLog] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setShowWelcome(true);
    }, 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (showWelcome && !authenticated) return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#00BFFF',
  },
  tabBarActiveTintColor: '#00BFFF',
  tabBarInactiveTintColor: 'gray',
  tabBarIcon: ({ color, size }) => {
    const icons = {
      'Bar A': 'beer',
      'Bar B': 'wine',
      'Bar C': 'cafe',
      'History': 'time'
    };
    return <Ionicons name={icons[route.name] || 'bar-chart'} size={size} color={color} />;
  }
})}>
  <Tab.Screen name="Bar A">
    {() => <BarTabsNavigator currentBar="barA" />}
  </Tab.Screen>
  <Tab.Screen name="Bar B">
    {() => <BarTabsNavigator currentBar="barB" />}
  </Tab.Screen>
  <Tab.Screen name="Bar C">
    {() => <BarTabsNavigator currentBar="barC" />}
  </Tab.Screen>
  <Tab.Screen name="History">
    {() => <HistoryScreen logs={historyLog} />}
  </Tab.Screen>
</Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5
  },
  itemName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  sales: {
    color: '#00BFFF',
    fontSize: 14
  },
  inventory: {
    color: '#FFD700',
    fontSize: 14
  },
  screen: {
    flex: 1,
    backgroundColor: '#121212'
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 60
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  salesLog: {
    color: '#B0E0E6',
    fontSize: 14,
    marginVertical: 2
  },
  tag: {
    fontSize: 14,
    color: '#FFD700'
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginTop: 4
  },
  progressBar: {
    height: 6,
    borderRadius: 3
  }
});
