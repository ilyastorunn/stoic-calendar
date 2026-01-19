/**
 * Share Icon Component
 * iOS-style share icon (arrow up from box)
 * Matches tab bar icon aesthetic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ShareIconProps {
  size?: number;
  color: string;
}

/**
 * ShareIcon
 * Renders an iOS-style share icon using basic shapes
 */
export function ShareIcon({ size = 24, color }: ShareIconProps) {
  const iconScale = size / 24; // Base size is 24

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {/* Box (bottom part) */}
      <View
        style={[
          styles.box,
          {
            width: 14 * iconScale,
            height: 10 * iconScale,
            borderWidth: 2 * iconScale,
            borderColor: color,
            borderRadius: 2 * iconScale,
          },
        ]}
      />

      {/* Arrow shaft (vertical line) */}
      <View
        style={[
          styles.arrowShaft,
          {
            width: 2 * iconScale,
            height: 12 * iconScale,
            backgroundColor: color,
            bottom: 6 * iconScale,
          },
        ]}
      />

      {/* Arrow head (two lines forming upward point) */}
      <View style={styles.arrowHead}>
        {/* Left diagonal */}
        <View
          style={[
            styles.arrowDiagonal,
            {
              width: 6 * iconScale,
              height: 2 * iconScale,
              backgroundColor: color,
              transform: [
                { rotate: '45deg' },
                { translateX: -2 * iconScale },
              ],
            },
          ]}
        />
        {/* Right diagonal */}
        <View
          style={[
            styles.arrowDiagonal,
            {
              width: 6 * iconScale,
              height: 2 * iconScale,
              backgroundColor: color,
              transform: [
                { rotate: '-45deg' },
                { translateX: 2 * iconScale },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  box: {
    position: 'absolute',
    bottom: 0,
  },
  arrowShaft: {
    position: 'absolute',
    borderRadius: 1,
  },
  arrowHead: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDiagonal: {
    borderRadius: 1,
    position: 'absolute',
  },
});
