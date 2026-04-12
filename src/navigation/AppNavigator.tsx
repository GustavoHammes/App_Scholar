import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CadastroAlunosScreen from '../screens/CadastroAlunosScreen';
import CadastroProfessoresScreen from '../screens/CadastroProfessoresScreen';
import CadastroDisciplinasScreen from '../screens/CadastroDisciplinasScreen';
import BoletimScreen from '../screens/BoletimScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CadastroAlunos" component={CadastroAlunosScreen} />
            <Stack.Screen name="CadastroProfessores" component={CadastroProfessoresScreen} />
            <Stack.Screen name="CadastroDisciplinas" component={CadastroDisciplinasScreen} />
            <Stack.Screen name="Boletim" component={BoletimScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
