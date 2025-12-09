import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserData = async () => {
  try {
    const storedUserData = await AsyncStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      console.log('User data:', userData);
      return userData;
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error reading user data:', error);
  }
};
