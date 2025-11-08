// src/utils/responsive.ts

import { Dimensions } from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;

// Definisikan breakpoint yang umum (Mobile, Tablet, Desktop)
const BREAKPOINTS = {
  sm: 360, // Mobile kecil
  md: 600, // Tablet portrait atau Mobile landscape
  lg: 992, // Tablet landscape atau Desktop
};

export const isTabletOrLandscape = (width: number) => width >= BREAKPOINTS.md;
export const isDesktop = (width: number) => width >= BREAKPOINTS.lg;

/**
 * Menghitung lebar card produk yang responsif berdasarkan lebar layar
 * @param currentWidth Lebar layar saat ini dari useWindowDimensions
 * @returns {string} Persentase lebar card (misalnya '100%', '48%', '31%')
 */
export const getResponsiveCardWidth = (currentWidth: number): string => {
  if (isDesktop(currentWidth)) {
    // 3 kolom untuk layar sangat lebar (misalnya tablet landscape)
    return '31%'; 
  }
  if (isTabletOrLandscape(currentWidth)) {
    // 2 kolom untuk tablet atau mode landscape
    return '48%';
  }
  // 1 kolom untuk mode portrait mobile
  return '100%'; 
};