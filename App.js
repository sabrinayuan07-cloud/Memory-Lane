import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from './screens/WelcomeScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';

import OnboardingScreen from './screens/user/OnboardingScreen';
import HomeScreen from './screens/user/HomeScreen';
import RecordScreen from './screens/user/RecordScreen';
import QuizzesScreen from './screens/user/QuizzesScreen';
import FamilyOnboarding from './screens/family/OnBoarding';
import ProfileScreen from './screens/user/ProfileScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Record') {
                        iconName = focused ? 'mic' : 'mic-outline';
                    } else if (route.name === 'Quizzes') {
                        iconName = focused ? 'bulb' : 'bulb-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={34} color={color} />;
                },
                tabBarActiveTintColor: '#1A1A2E',
                tabBarInactiveTintColor: '#595959',
                tabBarStyle: {
                    backgroundColor: '#F5F5F5',
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    paddingBottom: 30,
                    paddingTop: 14,
                    height: 105,
                },
                tabBarLabelStyle: {
                    fontSize: 15,
                    fontWeight: '700',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Record" component={RecordScreen} />
            <Tab.Screen name="Quizzes" component={QuizzesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="UserSelection" component={UserSelectionScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="FamilyOnboarding" component={FamilyOnboarding} />
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ gestureEnabled: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
