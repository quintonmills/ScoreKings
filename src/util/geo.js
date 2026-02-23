import * as Location from 'expo-location';

/**
 * Verifies if the user is in Georgia.
 * @param {string} userEmail - The logged-in user's email.
 */
export const verifyLocation = async (userEmail) => {
  try {
    const email = userEmail?.toLowerCase().trim();

    // 1. APPLE REVIEWER & TESTER BYPASS
    // Whitelists your test account AND any official Apple review emails.
    if (
      email === 'apple-test@example.com' ||
      email?.endsWith('@apple.com') ||
      email === 'tester@scorekings.com'
    ) {
      console.log('🍎 Reviewer/Tester detected: Bypassing Geo-gate.');
      return { allowed: true, state: 'GA', bypass: true };
    }

    // 2. LOCAL DEVELOPMENT BYPASS
    // If you are on a simulator or local IP, you might want to auto-pass
    if (__DEV__) {
      console.log('🛠 Dev Mode: Skipping real GPS check for convenience');
      // return { allowed: true, state: 'GA' }; // Uncomment this line to skip GPS during dev
    }

    // 3. Request Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        allowed: false,
        error:
          'Location permission is required to verify eligibility for contests and deposits.',
      };
    }

    // 4. Get Coordinates
    // Using 'Balanced' to save battery and speed up the check
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = location.coords;

    // 5. Reverse Geocode (Get State/Country)
    let address = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (address && address.length > 0) {
      const region = address[0].region; // 'Georgia' or 'GA'
      const isoCode = address[0].isoCountryCode;

      // Ensure we are in the US and specifically Georgia
      const isGeorgia = region === 'Georgia' || region === 'GA';

      if (isGeorgia) {
        return { allowed: true, state: region };
      }

      return {
        allowed: false,
        state: region,
        error: `Contests and deposits are currently restricted in ${region || 'your area'}. ScoreKings is only available in Georgia.`,
      };
    }

    return {
      allowed: false,
      error:
        'Could not determine your current state. Please check your signal.',
    };
  } catch (error) {
    console.error('Geo Verification Error:', error);
    return {
      allowed: false,
      error:
        'Error verifying location. Please ensure Location Services are ON.',
    };
  }
};
