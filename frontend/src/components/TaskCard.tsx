import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../utils/theme";
import type { Task } from "../api/tasks";
import { Button } from "./Button";

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  busy
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  busy?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onEdit ?? onToggle} disabled={busy} style={styles.row}>
        <View style={[styles.dot, task.completed && styles.dotDone]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
          {!!task.description && (
            <Text style={styles.desc} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Button title="Edit" onPress={onEdit ?? (() => {})} disabled={busy || !onEdit} variant="secondary" size="small" />
        <Button title={task.completed ? "Undo" : "Done"} onPress={onToggle} disabled={busy} variant="secondary" size="small" />
        <Button title="Delete" onPress={onDelete} disabled={busy} variant="danger" size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 12
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 5
  },
  dotDone: { backgroundColor: theme.colors.primary, borderColor: "transparent" },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  titleDone: { opacity: 0.7, textDecorationLine: "line-through" },
  desc: { color: theme.colors.muted, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10 }
});
