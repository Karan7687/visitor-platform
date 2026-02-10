import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  animationType?: 'bounce' | 'slide' | 'zoom' | 'confetti' | 'check-with-sparkles' | 'circle-only' | 'small-tick';
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  animationType = 'bounce',
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      slideAnim.setValue(-100);

      // Start animations based on type
      const animations = [];
      
      switch (animationType) {
        case 'bounce':
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          );
          break;
        case 'slide':
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          );
          break;
        case 'zoom':
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 4,
              useNativeDriver: true,
            })
          );
          break;
        case 'confetti':
        case 'check-with-sparkles':
        case 'circle-only':
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            })
          );
          break;
        case 'small-tick':
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 4,
              useNativeDriver: true,
            })
          );
          break;
        default:
          animations.push(
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          );
      }

      // Start animations
      Animated.parallel(animations).start();

      // Auto-hide for all alerts after 0.8 seconds
      const autoHideTimer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onClose();
        });
      }, 2000);

      return () => clearTimeout(autoHideTimer);
    }
  }, [visible, animationType, fadeAnim, scaleAnim, slideAnim]);

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return styles.successAlert;
      case 'error':
        return styles.errorAlert;
      case 'warning':
        return styles.warningAlert;
      case 'info':
        return styles.infoAlert;
      default:
        return styles.infoAlert;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getTransform = () => {
    if (animationType === 'slide') {
      return [{ translateY: slideAnim }];
    }
    return [{ scale: scaleAnim }];
  };

  if (!visible) return null;

  // Special case for circle-only - show only the green circle with checkmark and sparkles
  if (animationType === 'circle-only') {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.circleOnlyContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Sparkles around the circle */}
            <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.sparkleText}>⭐</Text>
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle4, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.sparkleText}>⭐</Text>
            </Animated.View>
            
            <View style={[styles.circleOnlyIcon, { backgroundColor: '#10b981' }]}>
              <Text style={styles.circleOnlyIconText}>✓</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // Special case for small-tick - show smaller green circle with checkmark for autofill scenarios
  if (animationType === 'small-tick') {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.smallTickContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={[styles.smallTickIcon, { backgroundColor: '#10b981' }]}>
              <Text style={styles.smallTickIconText}>✓</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            getAlertStyle(),
            {
              opacity: fadeAnim,
              transform: getTransform(),
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.icon, { backgroundColor: getIconColor() }]}>
              <Text style={styles.iconText}>{getIcon()}</Text>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: getIconColor() }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  errorAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  warningAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  circleOnlyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleOnlyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  circleOnlyIconText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
  sparkle1: {
    top: -20,
    left: -20,
  },
  sparkle2: {
    top: -20,
    right: -20,
  },
  sparkle3: {
    bottom: -20,
    left: -20,
  },
  sparkle4: {
    bottom: -20,
    right: -20,
  },
  sparkleText: {
    fontSize: 20,
  },
  smallTickContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallTickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  smallTickIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CustomAlert;
