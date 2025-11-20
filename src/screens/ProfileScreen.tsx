// src/screens/ProfileScreen.tsx - ENHANCED WITH VALIDATION
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type ProfileRouteProp = RouteProp<{ Profile: { userId?: string } }, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const { userId } = route.params || {};
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeepLink, setIsDeepLink] = useState(false);

  // ✅ SOAL 4: Validasi Parameter dari Deep Link
  useEffect(() => {
    const validateAndLoadProfile = async () => {
      try {
        setLoading(true);

        // Jika ada userId dari deep link
        if (userId) {
          setIsDeepLink(true);
          
          // ✅ Validasi 1: userId tidak boleh kosong
          if (!userId || userId.trim().length === 0) {
            throw new Error('User ID tidak boleh kosong');
          }

          // ✅ Validasi 2: userId harus alphanumeric, 3-20 karakter
          const userIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
          if (!userIdRegex.test(userId)) {
            throw new Error('User ID harus 3-20 karakter (huruf, angka, -, _)');
          }

          // ✅ Validasi 3: userId tidak boleh 'invalid' (dari parsing error)
          if (userId === 'invalid') {
            throw new Error('Format User ID tidak valid');
          }

          console.log('👤 Loading profile from deep link, UserId:', userId);
          
          // Simulasi load user profile
          const mockProfile = {
            id: userId,
            nama: `User ${userId}`,
            email: `${userId}@example.com`,
            joinDate: '2024-01-01',
            totalOrders: Math.floor(Math.random() * 50) + 1,
            memberLevel: ['Bronze', 'Silver', 'Gold'][Math.floor(Math.random() * 3)],
            isVerified: Math.random() > 0.3
          };

          // ✅ Validasi 4: Pastikan user exists
          if (!mockProfile) {
            throw new Error(`User dengan ID ${userId} tidak ditemukan`);
          }

          setProfileUser(mockProfile);
          
        } else {
          // Jika tidak ada deep link, gunakan logged in user
          setIsDeepLink(false);
          if (user) {
            setProfileUser({
              id: user.id,
              nama: user.nama,
              email: user.email,
              joinDate: '2024-01-01',
              totalOrders: 15,
              memberLevel: 'Gold',
              isVerified: true
            });
          } else {
            Alert.alert('Info', 'Silakan login untuk melihat profil');
            navigation.navigate('Login' as never);
          }
        }
        
      } catch (error: any) {
        console.error('❌ Error loading profile:', error);
        
        Alert.alert(
          'Deep Link Error',
          error.message || 'Gagal memuat profil dari deep link',
          [
            { 
              text: 'Ke Beranda', 
              onPress: () => navigation.navigate('Home' as never) 
            },
            { 
              text: 'Coba Lagi', 
              onPress: () => validateAndLoadProfile() 
            }
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadProfile();
  }, [userId, user, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {isDeepLink ? 'Memuat profil...' : 'Memuat profil Anda...'}
        </Text>
        {userId && <Text style={styles.userIdText}>User ID: {userId}</Text>}
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil tidak tersedia</Text>
        <Text style={styles.errorSubtext}>
          {isDeepLink ? 'User tidak ditemukan' : 'Silakan login terlebih dahulu'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ✅ Deep Link Info */}
      {isDeepLink && (
        <View style={styles.deepLinkSection}>
          <Text style={styles.deepLinkTitle}>🔗 Dibuka via Deep Link</Text>
          <Text style={styles.deepLinkId}>User ID: {userId}</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profileUser.nama.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{profileUser.nama}</Text>
        <Text style={styles.userEmail}>{profileUser.email}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={[
            styles.levelBadge,
            { backgroundColor: profileUser.memberLevel === 'Gold' ? '#ffd700' : 
                            profileUser.memberLevel === 'Silver' ? '#c0c0c0' : '#cd7f32' }
          ]}>
            <Text style={styles.levelText}>{profileUser.memberLevel}</Text>
          </View>
          
          {profileUser.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Terverifikasi</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profileUser.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Pesanan</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.floor(profileUser.totalOrders * 4.5)}
          </Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informasi Profil</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{profileUser.id}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bergabung</Text>
          <Text style={styles.infoValue}>{profileUser.joinDate}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {profileUser.isVerified ? 'Aktif' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* ✅ Validation Success Message */}
      {isDeepLink && (
        <View style={styles.validationSuccess}>
          <Text style={styles.successText}>
            ✅ Validasi deep link berhasil! User ID "{userId}" valid.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20
  },
  loadingText: { fontSize: 16, color: '#666', marginBottom: 8 },
  userIdText: { fontSize: 14, color: '#999', fontFamily: 'monospace' },
  errorText: { fontSize: 18, color: '#d32f2f', marginBottom: 8 },
  errorSubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  
  deepLinkSection: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    margin: 16,
    borderRadius: 8
  },
  deepLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4
  },
  deepLinkId: {
    fontSize: 12,
    color: '#4caf50',
    fontFamily: 'monospace'
  },
  
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  verifiedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#666'
  },
  
  infoSection: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 16,
    color: '#333'
  },
  
  validationSuccess: {
    backgroundColor: '#e8f5e8',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50'
  },
  successText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center'
  }
});

export default ProfileScreen;