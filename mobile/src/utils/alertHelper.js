import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog that works reliably on Web, iOS, and Android.
 */
export const showConfirm = (title, message, onConfirm, confirmText = 'Confirm') => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && onConfirm) {
        onConfirm();
      }
    } else if (onConfirm) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Cross-platform alert popup for notifications/errors/success.
 */
export const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n\n${message}`);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};
