import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function PickRecipientScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const recentContacts = [
    { id: '1', name: 'Sofia Martínez', phone: '+1 555 018 7722', avatar: 'S', color: '#A8B9E0', favorite: true },
    { id: '2', name: 'Mom', phone: '+1 555 019 2831', avatar: 'M', color: '#B9D7C2', favorite: false },
    { id: '3', name: 'Daniel Kim', phone: '+1 555 014 9912', avatar: 'D', color: '#D5B2D7', favorite: true },
    { id: '4', name: 'Ammu (Bangladesh)', phone: '+880 1711 234567', avatar: 'A', color: '#A7D7D1', favorite: true },
    { id: '5', name: 'Bluebird Cafe', phone: '+1 555 010 3399', avatar: 'B', color: '#F4C98B', favorite: false },
  ];

  const filtered = recentContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone.includes(query);
    return (!showFavoritesOnly || contact.favorite) && matchesSearch;
  });

  const selectContact = (contact: { name: string; phone: string }) => {
    router.push({
      pathname: '/send/amount',
      params: { name: contact.name, phone: contact.phone },
    });
  };

  const renderContact = (contact: (typeof recentContacts)[number], key = contact.id) => (
    <TouchableOpacity
      key={key}
      style={styles.contactItem}
      activeOpacity={0.7}
      onPress={() => selectContact(contact)}
    >
      <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
        <Text style={styles.avatarText}>{contact.avatar}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
      </View>
      {contact.favorite && <Text style={styles.favoriteTag}>Favorites</Text>}
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <Image source={require('../../assets/payora.png')} style={styles.brandIcon} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Name, @handle or phone"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoFocus={false}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {!query && (
            <View style={styles.shortcutRow}>
              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => setShowFavoritesOnly((current) => !current)}
                activeOpacity={0.75}
              >
                <Ionicons name="star-outline" size={18} color="#111827" />
                <Text style={styles.shortcutLabel}>
                  {showFavoritesOnly ? 'All contacts' : 'Favorites (3)'}
                </Text>
              </TouchableOpacity>
              <View style={styles.shortcutCard}>
                <Ionicons name="cash-outline" size={18} color="#111827" />
                <Text style={styles.shortcutLabel}>Request Money</Text>
              </View>
              <View style={styles.shortcutCard}>
                <Ionicons name="people-outline" size={18} color="#111827" />
                <Text style={styles.shortcutLabel}>Split Bill</Text>
              </View>
            </View>
          )}

          {query && filtered.length === 0 && (
            <TouchableOpacity
              style={styles.newRecipientCard}
              onPress={() => selectContact({ name: `User (${query})`, phone: query })}
            >
              <View style={styles.newAvatar}>
                <Ionicons name="person-add" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.newRecipientTitle}>Send to new recipient</Text>
                <Text style={styles.newRecipientPhone}>{query}</Text>
              </View>
            </TouchableOpacity>
          )}

          {!query && !showFavoritesOnly && (
            <>
              <Text style={styles.sectionTitle}>Recent</Text>
              {filtered.slice(0, 3).map((contact) => renderContact(contact, `recent-${contact.id}`))}
              <Text style={[styles.sectionTitle, styles.allContactsTitle]}>All contacts</Text>
            </>
          )}
          {showFavoritesOnly && !query && <Text style={styles.sectionTitle}>Favorites</Text>}
          {filtered.map((contact) => renderContact(contact))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 9,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111111',
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  shortcutCard: {
    width: '31.5%',
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  shortcutLabel: {
    color: '#111827',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  allContactsTitle: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 1,
  },
  contactPhone: {
    fontSize: 10,
    color: '#6B7280',
  },
  favoriteTag: {
    color: Colors.primary,
    backgroundColor: '#FCE7EB',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: '600',
    marginRight: 5,
  },
  newRecipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7EB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  newAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newRecipientTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  newRecipientPhone: {
    fontSize: 12,
    color: '#4B5563',
  },
});
