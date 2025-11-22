// src/screens/ProfileScreen.tsx - UPDATED WITH AVATAR UPLOAD
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useImagePicker } from '../hooks/useImagePicker';
import ImagePickerModal from '../components/ImagePickerModal';
import { SimpleImageAsset } from '../types/types';

type ProfileRouteProp = RouteProp<{ Profile: { userId?: string } }, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation();
  const { user, updateUserAvatar } = useAuth();
  const { pickAvatar, takeAvatarPhoto, uploading } = useImagePicker();
  
  const { userId } = route.params || {};
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeepLink, setIsDeepLink] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ✅ Load profile data
  useEffect(() => {
    const validateAndLoadProfile = async () => {
      try {
        setLoading(true);

        // Jika ada userId dari deep link
        if (userId) {
          setIsDeepLink(true);
          
          // Validasi userId
          if (!userId || userId.trim().length === 0) {
            throw new Error('User ID tidak boleh kosong');
          }

          const userIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
          if (!userIdRegex.test(userId)) {
            throw new Error('User ID harus 3-20 karakter (huruf, angka, -, _)');
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

          setProfileUser(mockProfile);
          
        } else {
          // Jika tidak ada deep link, gunakan logged in user
          setIsDeepLink(false);
          if (user) {
            setProfileUser({
              id: user.id,
              nama: user.nama,
              email: user.email,
              avatar: user.avatar,
              avatarBase64: user.avatarBase64,
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

  // 🆕 NEW: Handle avatar selection
  const handleImageSelected = async (asset: SimpleImageAsset) => {
    try {
      setAvatarLoading(true);
      
      // Simulasi upload ke server
      console.log('📤 Uploading avatar...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate URL avatar (simulasi)
      const avatarUrl = `https://example.com/avatars/user_${user?.id}_${Date.now()}.jpg`;
      
      // Update user avatar
      await updateUserAvatar(avatarUrl, asset.base64);
      
      // Update local state
      setProfileUser(prev => prev ? {
        ...prev,
        avatar: avatarUrl,
        avatarBase64: asset.base64
      } : null);
      
      Alert.alert('Sukses', 'Foto profil berhasil diupdate!');
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      Alert.alert('Error', 'Gagal mengupdate foto profil');
    } finally {
      setAvatarLoading(false);
    }
  };

  // 🆕 NEW: Handle avatar press
  const handleAvatarPress = () => {
    if (!user) {
      Alert.alert('Info', 'Silakan login untuk mengubah foto profil');
      return;
    }
    setShowImagePicker(true);
  };

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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ✅ Deep Link Info */}
        {isDeepLink && (
          <View style={styles.deepLinkSection}>
            <Text style={styles.deepLinkTitle}>🔗 Dibuka via Deep Link</Text>
            <Text style={styles.deepLinkId}>User ID: {userId}</Text>
          </View>
        )}

        <View style={styles.header}>
          {/* 🆕 NEW: Avatar dengan image picker */}
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            disabled={avatarLoading}
          >
            {avatarLoading ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#007AFF" />
              </View>
            ) : profileUser.avatarBase64 ? (
              <Image 
                source={{ uri: `data:image/jpeg;base64,${profileUser.avatarBase64}` }}
                style={styles.avatarImage}
              />
            ) : profileUser.avatar ? (
              <Image 
                source={{ uri: profileUser.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profileUser.nama.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>✎</Text>
            </View>
          </TouchableOpacity>

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

        {/* 🆕 NEW: Avatar Upload Info */}
        {!isDeepLink && (
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadInfoTitle}>📸 Foto Profil</Text>
            <Text style={styles.uploadInfoText}>
              Tap foto profil untuk mengubahnya. Gunakan kamera atau pilih dari galeri.
            </Text>
            {avatarLoading && (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.uploadingText}>Mengupload foto...</Text>
              </View>
            )}
          </View>
        )}

        {/* ✅ Validation Success Message */}
        {isDeepLink && (
          <View style={styles.validationSuccess}>
            <Text style={styles.successText}>
              ✅ Validasi deep link berhasil! User ID "{userId}" valid.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 🆕 NEW: Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        title="Pilih Foto Profil"
        includeBase64={true}
        showPreview={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollView: {
    flex: 1,
  },
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
  loadingText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 8 
  },
  userIdText: { 
    fontSize: 14, 
    color: '#999', 
    fontFamily: 'monospace' 
  },
  errorText: { 
    fontSize: 18, 
    color: '#d32f2f', 
    marginBottom: 8 
  },
  errorSubtext: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center' 
  },
  
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  avatarEditText: {
    color: '#fff',
    fontSize: 14,
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
  
  // 🆕 NEW: Upload Info Styles
  uploadInfo: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  uploadInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8
  },
  uploadInfoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2'
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