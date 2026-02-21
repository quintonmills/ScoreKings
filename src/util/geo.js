import * as Location from 'expo-location';

export const verifyLocation = async () => {
  try {
    // 1. Request Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        allowed: false,
        error: 'Permission denied. Please enable location in settings.',
      };
    }

    // 2. Get Coordinates
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // 3. Reverse Geocode (Get State/Country)
    let address = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (address.length > 0) {
      const userState = address[0].region; // 'Georgia' or 'GA'

      // Check for Georgia
      if (userState === 'Georgia' || userState === 'GA') {
        return { allowed: true, state: userState };
      }
      return {
        allowed: false,
        state: userState,
        error: `Contests are not yet available in ${userState}.`,
      };
    }

    return { allowed: false, error: 'Could not determine location.' };
  } catch (error) {
    console.error(error);
    return { allowed: false, error: 'Error verifying location.' };
  }
};
