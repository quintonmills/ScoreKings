import { Platform } from 'react-native';

let StripeProvider = ({ children }) => <>{children}</>;

// Only load the native library if we are NOT on web
if (Platform.OS !== 'web') {
  const {
    StripeProvider: NativeProvider,
  } = require('@stripe/stripe-react-native');
  StripeProvider = NativeProvider;
}

export default StripeProvider;
