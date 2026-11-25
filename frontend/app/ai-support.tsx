import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';
import { ApiService } from '../src/services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function AiSupportScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello Noor! 👋 I am your Payora 24/7 AI Financial Assistant. Ask me anything about multi-currency rates, double-entry ledger security, transfer fees, or account limits.',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    'What are the live exchange rates?',
    'How does double-entry protect my money?',
    'What are the fees for sending abroad?',
    'Is my biometric data stored safely?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await ApiService.chatWithAi(textToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'At Payora, all transfers are verified with strict double-entry ledger invariants. How else can I help you?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Payora AI Support</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>Instant Response</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

        {/* Messages */}
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubbleRow,
              msg.sender === 'user' ? styles.userRow : styles.botRow,
            ]}
          >
            {msg.sender === 'bot' && (
              <View style={styles.botAvatarCircle}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.botText,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  msg.sender === 'user' ? styles.userTime : styles.botTime,
                ]}
              >
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubbleRow, styles.botRow]}>
            <View style={styles.botAvatarCircle}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.botText}>Payora AI is typing...</Text>
            </View>
          </View>
        )}
        </ScrollView>

        {/* Quick Questions Row */}
        <View style={styles.quickQuestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickChip}
              onPress={() => handleSend(q)}
            >
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>

        {/* Input Row */}
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendButton, input.trim() ? styles.sendActive : styles.sendDisabled]}
            disabled={!input.trim()}
            onPress={() => handleSend()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 11,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTime: {
    color: '#9CA3AF',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  quickChip: {
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111111',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendActive: {
    backgroundColor: Colors.primary,
  },
  sendDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
