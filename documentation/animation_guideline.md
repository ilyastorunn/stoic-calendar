# Stoic Calendar - Animasyonlar Teknik Özeti

Bu dokümanda, Stoic Calendar uygulamasında kullanılan tüm animasyonlar, bunların nasıl oluşturulduğu ve hangi kütüphaneler kullanıldığı detaylı olarak açıklanmıştır.

---

## 1. Kullanılan Kütüphaneler

### **react-native-reanimated** (v4.x)

- **Amaç:** React Native'de yüksek performanslı, GPU-hızlandırılmış animasyonlar
- **Neden seçildi:** Native thread'te çalışır, UI thread'i bloke etmez, 60fps+ performans
- **Kurulum:** `pnpm add react-native-reanimated`

### **expo-blur** (v15.x)

- **Amaç:** iOS/Android'de blur efekti (floating tab bar için)
- **Neden seçildi:** Native performans, sistem uyumluluğu
- **Kurulum:** `pnpm add expo-blur`

### **expo-haptics**

- **Amaç:** Dokunsal geri bildirim (haptic feedback)
- **Neden seçildi:** Kullanıcı etkileşimini güçlendirmek
- **Kurulum:** Zaten template'de dahil

---

## 2. Animasyon Türleri ve Uygulamaları

### **A. Stoic Grid - Nokta Doldurma Animasyonu**

**Dosya:** `components/stoic-grid.tsx`

**Amaç:** Grid'deki noktaların sırayla belirip büyümesi (organik, dalga gibi efekt)

**Teknik Detaylar:**

```typescript
// 1. Shared Values (reanimated state)
const progress = useSharedValue(animate ? 0 : 1);

// 2. Animasyon Trigger
useEffect(() => {
  if (animate) {
    // Dalga efekti: her nokta sırayla animasyona başlıyor
    const maxDelay = Math.min(totalDots * 1.5, 600); // Max 600ms
    const delay = (index / totalDots) * maxDelay;    // Orantılı gecikme
    
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic), // Cubic easing (hızlı başlayıp yavaşlıyor)
      })
    );
  }
}, [animate, index, totalDots, progress]);

// 3. Animated Style (GPU'da hesaplanır)
const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: progress.value,                    // 0 → 1 fade in
    transform: [
      { scale: 0.6 + progress.value * 0.4 },  // 0.6 → 1.0 büyüme
    ],
  };
});
```

**Sonuç:** Noktalar yumuşak bir dalga gibi beliriyor, her nokta 0.6 ölçeğinden başlayıp 1.0'a büyüyor.

**Performans:** Tüm noktalar paralel olarak animasyona giriyor (GPU'da), UI thread'i etkilemiyor.

---

### **B. Floating Tab Bar - Blur Efekti ve Animasyon**

**Dosya:** `app/(tabs)/_layout.tsx`

**Amaç:** Tab bar'ın hafif, modern ve detached görünümü

**Teknik Detaylar:**

```typescript
// 1. iOS'ta BlurView (native blur)
<BlurView
  intensity={80}        // 0-100 blur yoğunluğu
  tint={isDark ? "dark" : "light"}
  style={styles.blurContainer}
>
  {/* Tab items */}
</BlurView>

// 2. Android/Web fallback (transparent background)
<View
  style={{
    backgroundColor: colors.tabBarBackground, // rgba(28, 28, 30, 0.8)
  }}
/>

// 3. Tab Button Scale Animasyonu
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { scale: withTiming(isActive ? 1 : 0.92, { duration: 200 }) },
    ],
    opacity: withTiming(isActive ? 1 : 0.5, { duration: 200 }),
  };
});
```

**Sonuç:**

- Aktif tab normal boyutta (scale: 1), tam opasite
- İnaktif tab küçük (scale: 0.92), yarı saydam (opacity: 0.5)
- Geçiş 200ms'de yumuşak

**Styling:**

```javascript
tabBarStyle: {
  borderRadius: 28,           // Pill-shaped
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,           // Soft shadow
  elevation: 8,               // Android shadow
}
```

---

### **C. Ekran Geçişleri - FadeIn Animasyonları**

**Dosya:** `app/(tabs)/index.tsx`, `app/(tabs)/customize.tsx`, `app/(tabs)/settings.tsx`

**Amaç:** Ekran yüklendiğinde yumuşak fade-in efekti

**Teknik Detaylar:**

```typescript
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

// 1. Basit Fade In (başlık)
<Animated.View entering={FadeIn.duration(400)}>
  <Text style={styles.title}>Timeline</Text>
</Animated.View>

// 2. Fade In Down (liste öğeleri - kademeli)
<Animated.View 
  entering={FadeInDown.duration(300).delay(index * 50)}
>
  <TimelineCard {...props} />
</Animated.View>

// 3. Cascade Efekti (Settings)
<Animated.View entering={FadeInDown.duration(300).delay(100)}>
  {/* Appearance Section */}
</Animated.View>
<Animated.View entering={FadeInDown.duration(300).delay(200)}>
  {/* About Section */}
</Animated.View>
<Animated.View entering={FadeInDown.duration(300).delay(300)}>
  {/* Philosophy Section */}
</Animated.View>
```

**Sonuç:**

- `FadeIn`: Opacity 0 → 1, 400ms
- `FadeInDown`: Opacity 0 → 1 + Y position -20 → 0, 300ms
- `delay()`: Her öğe 50ms sonra başlıyor (cascade efekti)

---

### **D. Timeline Card - Aktif Durum Göstergesi**

**Dosya:** `components/timeline-card.tsx`

**Amaç:** Seçili timeline'ı görsel olarak vurgulama

**Teknik Detaylar:**

```typescript
// Aktif durum: Sol tarafta renkli bar
{isActive && (
  <View 
    style={[
      styles.activeBar, 
      { backgroundColor: colors.primary }
    ]} 
  />
)}

// Stil
activeBar: {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 3,
  borderTopLeftRadius: 16,
  borderBottomLeftRadius: 16,
}
```

**Sonuç:** Aktif card'ın sol kenarında 3px mavi bar görünüyor (statik, animasyonsuz)

---

### **E. Home Screen - Staggered Grid Animasyonu**

**Dosya:** `app/(tabs)/index.tsx`

**Amaç:** Grid'in ekrana yumuşak girmesi

**Teknik Detaylar:**

```typescript
// Header fade in
<Animated.View entering={FadeIn.duration(400)}>
  <Text style={styles.title}>{activeTimeline.title}</Text>
</Animated.View>

// Grid fade in (header'dan 200ms sonra)
<Animated.View entering={FadeIn.duration(600).delay(200)}>
  <StoicGrid {...props} />
</Animated.View>

// Footer fade in (grid'den 400ms sonra)
<Animated.View entering={FadeIn.duration(400).delay(400)}>
  <Text style={styles.footerText}>...</Text>
</Animated.View>
```

**Sonuç:** Başlık → Grid → Footer sırayla beliriyor, toplam 1000ms

---

### **F. Haptic Feedback - Dokunsal Geri Bildirim**

**Dosya:** `app/(tabs)/_layout.tsx`

**Amaç:** Kullanıcı tab'a tıkladığında hafif titreşim

**Teknik Detaylar:**

```typescript
import * as Haptics from "expo-haptics";

const handleTabPress = (tabName: string, index: number) => {
  if (state.index !== index) {
    // Sadece tab değiştiğinde haptic
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate(tabName);
  }
};
```

**Sonuç:** Hafif titreşim (Light impact) - çok ince, rahatsız etmez

---

## 3. Animasyon Tasarım Prensipleri

### **iOS 26 Felsefesi:**

1. **Minimal:** Sadece gerekli animasyonlar
2. **Organik:** Doğal, yumuşak hareketler
3. **Hızlı:** 200-400ms (hiç uzun değil)
4. **Amaçlı:** Her animasyonun bir amacı var (durumu göster, dikkat çek, vb.)

### **Easing Seçimleri:**

- `Easing.out(Easing.cubic)`: Hızlı başlayıp yavaşlıyor (doğal hissettiriyor)
- `withTiming()`: Lineer animasyon (basit, öngörülebilir)
- `withDelay()`: Cascade efektleri için

### **Performans Kuralları:**

- ✅ `useAnimatedStyle()` ve `useSharedValue()` kullan (GPU'da çalışır)
- ❌ State güncellemesi yapma (UI thread'i bloke eder)
- ❌ Çok fazla animasyon paralel çalıştırma (60fps düşer)
- ✅ `React.memo()` ile component'leri memoize et

---

## 4. Kod Örneği: Sıfırdan Animasyon Oluşturma

Yeni bir animasyon eklemek istersen:

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export function MyAnimatedComponent() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + progress.value * 0.2 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text>Animated Content</Text>
    </Animated.View>
  );
}
```

---

## 5. Debugging İpuçları

### **Animasyon Yavaş mı?**

1. DevTools'da "Performance" seç
2. FPS meter'ı aç (60fps altına düşüyor mu?)
3. `React.memo()` ekle
4. Animasyon sayısını azalt

### **Animasyon Çalışmıyor mu?**

1. `useAnimatedStyle()` içinde `useSharedValue()` kullandığını kontrol et
2. `withTiming()` veya `withDelay()` var mı?
3. Component mount olduğunda `useEffect()` trigger oluyor mu?

### **Blur Efekti Çalışmıyor (Android)?**

- Fallback olarak `backgroundColor` kullan (zaten yapılmış)

---

## 6. Özet Tablo

| Animasyon | Dosya | Kütüphane | Süre | Amaç |
|-----------|-------|-----------|------|------|
| Grid Nokta Doldurma | `stoic-grid.tsx` | reanimated | 300ms + delay | Dalga efekti |
| Tab Bar Scale | `_layout.tsx` | reanimated | 200ms | Aktif göstergesi |
| Ekran Fade In | `index.tsx` vb. | reanimated | 400-600ms | Yumuşak giriş |
| Blur Effect | `_layout.tsx` | expo-blur | - | Modern görünüm |
| Haptic | `_layout.tsx` | expo-haptics | - | Dokunsal geri bildirim |

---

## 7. Gelecek İyileştirmeler

- [ ] Gesture-based animasyonlar (swipe tab geçişi)
- [ ] Spring animasyonlar (daha canlı hissettirmek için)
- [ ] Parallax efektleri (scroll sırasında)
- [ ] Lottie animasyonlar (karmaşık şekiller için)
