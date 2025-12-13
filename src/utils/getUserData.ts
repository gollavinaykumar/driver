import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export const getUserData = async () => {
  try {
    const storedUserData = await AsyncStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      logger.log('User data:', userData);
      return userData;
    } else {
      logger.log('No user data found');
      return null;
    }
  } catch (error) {
    logger.error('Error reading user data:', error);
    return null;
  }
};
