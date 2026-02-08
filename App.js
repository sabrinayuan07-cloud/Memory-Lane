import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from './screens/WelcomeScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';

// User/Senior screens
import OnboardingScreen from './screens/user/OnboardingScreen';
import HomeScreen from './screens/user/HomeScreen';
import RecordScreen from './screens/user/RecordScreen';
import QuizzesScreen from './screens/user/QuizzesScreen';
import ProfileScreen from './screens/user/ProfileScreen';
import TutorialScreen from './screens/user/TutorialScreen';

// Family screens
import FamilyOnboarding from './screens/family/OnBoarding';
import FamilyHomeScreen from './screens/family/HomeScreen';
import FamilyRecordScreen from './screens/family/RecordScreen';
import FamilyProfileScreen from './screens/family/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Senior/User Tabs (Blue theme) - LARGE for elderly users
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
                    return <Ionicons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: '#1A1A2E',
                tabBarInactiveTintColor: '#595959',
                tabBarStyle: {
                    backgroundColor: '#F5F5F5',
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    paddingBottom: 30,
                    paddingTop: 12,
                    height: 105,
                },
                tabBarLabelStyle: {
                    fontSize: 20,
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

// Family Tabs (Green theme) - icon-only, no labels
function FamilyTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'AddMemory') {
                        return (
                            <View style={{
                                width: 44, height: 44, borderRadius: 22,
                                borderWidth: 2.5, borderColor: color,
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Ionicons name="add" size={28} color={color} />
                            </View>
                        );
                    }
                    let iconName;
                    if (route.name === 'FamilyHome') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Updates') {
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
                    paddingBottom: 26,
                    paddingTop: 14,
                    height: 80,
                },
            })}
        >
            <Tab.Screen name="FamilyHome" component={FamilyHomeScreen} />
            <Tab.Screen name="AddMemory" component={FamilyRecordScreen} />
            <Tab.Screen name="Updates" component={FamilyProfileScreen} />
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
                <Stack.Screen name="Tutorial" component={TutorialScreen} />
                <Stack.Screen name="FamilyOnboarding" component={FamilyOnboarding} />
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                    name="FamilyHome"
                    component={FamilyTabs}
                    options={{ gestureEnabled: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}