// src/utils/responsive.ts
import { Dimensions, DimensionValue } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isTablet = width >= 768;
export const isLandscape = width > height;

export const getResponsiveCardWidth = (screenWidth: number): DimensionValue => {
  if (screenWidth < 375) return '100%'; // Small phones
  if (screenWidth < 768) return '48%';  // Phones
  if (screenWidth < 1024) return '32%'; // Tablets
  return '24%'; // Large tablets/desktop
};

export const getResponsiveFontSize = (size: number): number => {
  const scale = isTablet ? 1.2 : 1;
  return size * scale;
};

export const getResponsivePadding = (): number => {
  if (width < 375) return 12;
  if (width < 768) return 16;
  return 20;
};