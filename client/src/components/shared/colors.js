// Whisk-It Bakery Color Palette
// Centralized color constants for consistent theming

// Primary Colors - Warm Beige & Cream Theme
export const COLORS = {
  // Primary Brown Shades
  primary: '#8b4513',          // Saddle Brown - Main brand color
  primaryDark: '#654321',     // Darker brown for emphasis
  primaryLight: '#a0826d',    // Light brown for secondary elements
  
  // Warm Beige & Cream Tones
  beige: '#d4a574',           // Sandy Beige - Accent color
  cream: '#fffdf9',           // Warm cream background
  creamLight: '#fefcf8',      // Lighter cream
  creamDark: '#f5e6d3',       // Darker cream for backgrounds
  
  // Secondary Brown Variations
  brownLight: '#c19a6b',      // Light brown
  brownMedium: '#a0826d',     // Medium brown
  brownDark: '#8b4513',       // Dark brown
  
  // Success Colors
  success: '#16a34a',         // Green for positive actions
  successLight: '#22c55e',    // Light green
  successDark: '#15803d',     // Dark green
  
  // Warning Colors
  warning: '#f59e0b',         // Amber for warnings
  warningLight: '#fbbf24',    // Light amber
  warningDark: '#d97706',     // Dark amber
  
  // Error Colors
  error: '#dc2626',           // Red for errors
  errorLight: '#ef4444',      // Light red
  errorDark: '#b91c1c',       // Dark red
  
  // Neutral Colors
  white: '#ffffff',           // Pure white
  grayLight: '#f3f4f6',       // Light gray
  gray: '#6b7280',            // Medium gray
  grayDark: '#374151',        // Dark gray
  black: '#000000',           // Pure black
  
  // Background Colors
  background: 'rgba(255, 253, 250, 0.95)',  // Semi-transparent cream
  backgroundLight: 'rgba(255, 249, 240, 0.95)', // Lighter background
  backgroundDark: 'rgba(245, 230, 211, 0.95)', // Darker background
  
  // Border Colors
  border: 'rgba(139, 69, 19, 0.1)',          // Light brown border
  borderDark: 'rgba(139, 69, 19, 0.2)',      // Medium border
  borderLight: 'rgba(212, 165, 116, 0.3)',   // Light beige border
  
  // Shadow Colors
  shadow: 'rgba(139, 69, 19, 0.15)',         // Standard shadow
  shadowDark: 'rgba(139, 69, 19, 0.25)',     // Dark shadow
  shadowLight: 'rgba(139, 69, 19, 0.1)',     // Light shadow
  
  // Gradient Backgrounds
  gradients: {
    primary: 'linear-gradient(135deg, #8b4513 0%, #a0826d 100%)',
    secondary: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)',
    tertiary: 'linear-gradient(135deg, #a0826d 0%, #8b4513 100%)',
    background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 253, 250, 0.95) 0%, rgba(255, 249, 240, 0.95) 100%)',
    icon: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)',
    hover: 'linear-gradient(135deg, #a0826d 0%, #8b4513 100%)'
  },
  
  // Icon Colors
  icons: {
    primary: '#8b4513',
    secondary: '#d4a574',
    tertiary: '#c19a6b',
    white: '#ffffff',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626'
  },
  
  // Text Colors
  text: {
    primary: '#8b4513',         // Main text color
    secondary: '#a0826d',       // Secondary text
    tertiary: '#d4a574',        // Tertiary text
    light: '#f5e6d3',           // Light text on dark backgrounds
    white: '#ffffff',           // White text
    muted: 'rgba(160, 130, 109, 0.8)', // Muted text
    placeholder: 'rgba(160, 130, 109, 0.6)' // Placeholder text
  }
};

// Color Utilities
export const getColorWithOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Theme-specific color combinations
export const THEMES = {
  bakery: {
    primary: COLORS.primary,
    secondary: COLORS.beige,
    background: COLORS.background,
    text: COLORS.text.primary,
    accent: COLORS.brownLight
  },
  admin: {
    primary: COLORS.primary,
    secondary: COLORS.beige,
    background: COLORS.background,
    text: COLORS.text.primary,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error
  }
};

export default COLORS;
