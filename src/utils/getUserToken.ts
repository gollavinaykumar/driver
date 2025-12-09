import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      console.log('token found', token);
      return token;
    } else {
      console.log('No token found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};
