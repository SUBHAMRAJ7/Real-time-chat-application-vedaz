import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";

const API_URL = "http://localhost:5000";

interface Message {
  _id: string;
  username: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface TypingData {
  username: string;
  isTyping: boolean;
}

export default function HomeScreen() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------------------------------------
  // FETCH PREVIOUS MESSAGES
  // --------------------------------------------------

  useEffect(() => {
    if (!joined) {
      return;
    }

    fetch(`${API_URL}/api/messages`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        return response.json();
      })
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error("Failed to fetch messages:", error);
      });
  }, [joined]);

  // --------------------------------------------------
  // SOCKET.IO CONNECTION
  // --------------------------------------------------

  useEffect(() => {
    if (!joined) {
      return;
    }

    const socket = io(API_URL);

    socketRef.current = socket;

    // Connected
    socket.on("connect", () => {
      console.log("Connected to Socket.io:", socket.id);

      setConnected(true);

      socket.emit("user_joined", {
        username,
      });
    });

    // Disconnected
    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io");

      setConnected(false);
    });

    // New message
    socket.on("new_message", (newMessage: Message) => {
      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });
    });

    // Typing indicator
    socket.on("user_typing", (data: TypingData) => {
      if (data.username === username) {
        return;
      }

      if (data.isTyping) {
        setTypingUser(data.username);
      } else {
        setTypingUser("");
      }
    });

    // Socket error
    socket.on("message_error", (error) => {
      console.error("Socket message error:", error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joined, username]);

  // --------------------------------------------------
  // JOIN CHAT
  // --------------------------------------------------

  const joinChat = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return;
    }

    setUsername(trimmedUsername);
    setJoined(true);
  };

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || !connected) {
      console.log("Socket is not connected");
      return;
    }

    socketRef.current.emit("send_message", {
      username,
      text: trimmedMessage,
    });

    // Stop typing indicator
    socketRef.current.emit("typing", {
      username,
      isTyping: false,
    });

    setMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // --------------------------------------------------
  // HANDLE TYPING
  // --------------------------------------------------

  const handleTyping = (text: string) => {
    setMessage(text);

    if (!socketRef.current || !connected) {
      return;
    }

    // Tell other users that we are typing
    socketRef.current.emit("typing", {
      username,
      isTyping: text.length > 0,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1.5 seconds
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && connected) {
          socketRef.current.emit("typing", {
            username,
            isTyping: false,
          });
        }
      }, 1500);
    }
  };

  // --------------------------------------------------
  // FORMAT MESSAGE TIME
  // --------------------------------------------------

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------------------------------------
  // RENDER MESSAGE
  // --------------------------------------------------

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.username === username;

    return (
      <View
        style={[
          styles.messageContainer,
          isMine
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isMine && (
          <Text style={styles.username}>
            {item.username}
          </Text>
        )}

        <Text style={styles.messageText}>
          {item.text}
        </Text>

        <Text
          style={[
            styles.timestamp,
            isMine
              ? styles.myTimestamp
              : styles.otherTimestamp,
          ]}
        >
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  // ==================================================
  // LOGIN SCREEN
  // ==================================================

  if (!joined) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.chatIcon}>💬</Text>

          <Text style={styles.loginTitle}>
            Real-Time Chat
          </Text>

          <Text style={styles.loginSubtitle}>
            Enter your username to join the chat
          </Text>

          <TextInput
            style={styles.usernameInput}
            placeholder="Enter username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={joinChat}
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={joinChat}
          >
            <Text style={styles.joinButtonText}>
              Join Chat
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // CHAT SCREEN
  // ==================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Real-Time Chat
            </Text>

            <Text style={styles.usernameHeader}>
              You: {username}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                connected
                  ? styles.online
                  : styles.offline,
              ]}
            />

            <Text style={styles.statusText}>
              {connected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* MESSAGES */}

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* TYPING INDICATOR */}

        {typingUser ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUser} is typing...
            </Text>
          </View>
        ) : null}

        {/* MESSAGE INPUT */}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            multiline
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !connected && styles.disabledButton,
            ]}
            onPress={sendMessage}
            disabled={!connected}
          >
            <Text style={styles.sendButtonText}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  // --------------------------------------------------
  // LOGIN SCREEN
  // --------------------------------------------------

  loginContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loginCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },

  chatIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#075e54",
  },

  loginSubtitle: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
    marginBottom: 25,
    textAlign: "center",
  },

  usernameInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#111",
  },

  joinButton: {
    width: "100%",
    backgroundColor: "#075e54",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  joinButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  // --------------------------------------------------
  // CHAT SCREEN
  // --------------------------------------------------

  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  container: {
    flex: 1,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  header: {
    backgroundColor: "#075e54",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },

  usernameHeader: {
    color: "#d9f5f0",
    marginTop: 4,
    fontSize: 13,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  online: {
    backgroundColor: "#4caf50",
  },

  offline: {
    backgroundColor: "#999999",
  },

  statusText: {
    color: "#ffffff",
    fontSize: 13,
  },

  // --------------------------------------------------
  // MESSAGES
  // --------------------------------------------------

  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },

  messageContainer: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },

  myMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
    borderBottomRightRadius: 3,
  },

  otherMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 3,
  },

  username: {
    fontSize: 12,
    fontWeight: "700",
    color: "#075e54",
    marginBottom: 3,
  },

  messageText: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 21,
  },

  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  myTimestamp: {
    color: "#667766",
  },

  otherTimestamp: {
    color: "#888888",
  },

  // --------------------------------------------------
  // TYPING INDICATOR
  // --------------------------------------------------

  typingContainer: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
  },

  typingText: {
    color: "#777",
    fontSize: 13,
    fontStyle: "italic",
  },

  // --------------------------------------------------
  // MESSAGE INPUT
  // --------------------------------------------------

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#eeeeee",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },

  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    color: "#111111",
  },

  sendButton: {
    backgroundColor: "#075e54",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
  },

  disabledButton: {
    backgroundColor: "#999999",
  },

  sendButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});