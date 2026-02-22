import * as Location from 'expo-location';

/**
 * Verifies if the user is in Georgia.
 * @param {string} userEmail - Pass the logged-in user's email to allow Apple reviewers to bypass.
 */
export const verifyLocation = async (userEmail) => {
  try {
    // 1. APPLE REVIEWER BYPASS
    // Replace 'apple-test@example.com' with your actual test account email.
    if (userEmail && userEmail.toLowerCase() === 'apple-test@example.com') {
      console.log('Reviewer detected: Bypassing Geo-gate.');
      return { allowed: true, state: 'Georgia (Review Mode)' };
    }

    // 2. Request Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        allowed: false,
        error:
          'Location permission is required to verify state eligibility for deposits.',
      };
    }

    // 3. Get Coordinates
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = location.coords;

    // 4. Reverse Geocode (Get State/Country)
    let address = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (address.length > 0) {
      const userState = address[0].region; // e.g., 'Georgia' or 'GA'

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

    return { allowed: false, error: 'Could not determine your current state.' };
  } catch (error) {
    console.error('Geo Verification Error:', error);
    return {
      allowed: false,
      error: 'Error verifying location. Please try again.',
    };
  }
};
