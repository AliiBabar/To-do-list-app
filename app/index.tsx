import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import * as Notifications from "expo-notifications";

// Light and Dark Themes
const lightTheme = {
  container: "#f4f6f9",
  background: "#ffffff",
  text: "#333333",
  border: "#cccccc",
  header: "#222222",
  button: "#1E90FF",
  shadow: "#000000",
};

const darkTheme = {
  container: "#121212",
  background: "#1E1E1E",
  text: "#f5f5f5",
  border: "#444444",
  header: "#ffffff",
  button: "#bb86fc",
  shadow: "#000000",
};

export default function App() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Work");
  const [tasks, setTasks] = useState<
    { task: string; priority: string; category: string; completed: boolean; id: string }[]
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Notifications will not work without permission.");
      }
    };
    requestPermissions();
  }, []);

  const addTask = () => {
    if (task.trim()) {
      if (editingIndex !== null) {
        const updatedTasks = [...tasks];
        updatedTasks[editingIndex] = { ...updatedTasks[editingIndex], task, priority, category };
        setTasks(updatedTasks);
        setEditingIndex(null);
      } else {
        setTasks([
          ...tasks,
          { task, priority, category, completed: false, id: Date.now().toString() },
        ]);
      }
      setTask("");
      setPriority("Medium");
      setCategory("Work");
    }
  };

  const deleteTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const toggleTaskCompletion = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const scheduleNotification = async (taskName: string, seconds: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Reminder for task: ${taskName}`,
      },
      trigger: {
        type: "timeInterval",
        seconds: seconds,
        repeats: false,
      } as any, // Temporary fix for TypeScript type mismatch
    });
    Alert.alert("Reminder Set", `Notification will appear in ${seconds} seconds.`);
  };
  

  const editTask = (index: number) => {
    setTask(tasks[index].task);
    setPriority(tasks[index].priority);
    setCategory(tasks[index].category);
    setEditingIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.container }]}>
      {/* Light/Dark Mode Toggle */}
      <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
        <Button
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onPress={() => setIsDarkMode((prev) => !prev)}
          color={theme.button}
        />
      </View>

      <Text style={[styles.header, { color: theme.header }]}>To-Do List</Text>

      {/* Input Section */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
        ]}
        placeholder="Enter a task"
        placeholderTextColor={theme.text}
        value={task}
        onChangeText={setTask}
      />

      <Text style={[styles.label, { color: theme.text }]}>Priority:</Text>
      <Picker
        selectedValue={priority}
        onValueChange={(value) => setPriority(value)}
        style={styles.picker}
      >
        <Picker.Item label="High" value="High" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Low" value="Low" />
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        <Picker.Item label="Work" value="Work" />
        <Picker.Item label="Personal" value="Personal" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Button title={editingIndex !== null ? "Update Task" : "Add Task"} onPress={addTask} />

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.taskItem}>
            <Checkbox
              value={item.completed}
              onValueChange={() => toggleTaskCompletion(index)}
              color={theme.button}
            />
            <Text
              style={[
                styles.taskText,
                { color: theme.text },
                item.completed && { textDecorationLine: "line-through", color: "gray" },
              ]}
            >
              {item.task} - <Text style={{ fontWeight: "bold" }}>{item.priority}</Text> -{" "}
              <Text style={{ fontStyle: "italic" }}>{item.category}</Text>
            </Text>
            <View style={styles.buttonGroup}>
              <Pressable onPress={() => editTask(index)}>
                <Text style={styles.editButton}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => deleteTask(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </Pressable>
              <Pressable onPress={() => scheduleNotification(item.task, 60)}>
                <Text style={styles.reminderButton}>Set Reminder</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
  label: { fontSize: 16, marginBottom: 5 },
  picker: { marginBottom: 10 },
  taskItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  taskText: { flex: 1, marginLeft: 10, fontSize: 16 },
  buttonGroup: { flexDirection: "row", gap: 10 },
  editButton: { color: "blue" },
  deleteButton: { color: "red" },
  reminderButton: { color: "green", fontWeight: "bold" },
});
