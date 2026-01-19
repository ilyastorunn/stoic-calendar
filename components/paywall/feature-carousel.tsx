/**
 * Feature Carousel Component
 * Horizontal scrolling carousel with feature slides
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { FeatureSlide, FeatureType } from './feature-slide';
import { PaginationDots } from './pagination-dots';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeatureCarouselProps {
  features: FeatureType[];
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={features}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => <FeatureSlide type={item} />}
        keyExtractor={(item) => item}
      />

      <PaginationDots total={features.length} activeIndex={activeIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
});
