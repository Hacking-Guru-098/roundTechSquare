import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, listTasks, updateTask } from "../api/tasks";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";
import { TaskCard } from "../components/TaskCard";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { theme } from "../utils/theme";

type Filter = "all" | "active" | "completed";

export function TaskListScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await tasksQuery.refetch();
    setIsRefreshing(false);
  };

  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: listTasks });

  const tasks = tasksQuery.data ?? [];
  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const editingTask = useMemo(() => tasks.find((t) => t._id === editingId) ?? null, [tasks, editingId]);
  const isEditOpen = !!editingId;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const createMutation = useMutation({
    mutationFn: (input: { title: string; description?: string }) =>
      createTask({ title: input.title.trim(), description: input.description?.trim() || undefined }),
    onMutate: async (input) => {
      const trimmed = input.title.trim();
      if (!trimmed) return;
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"]);
      const tempId = `temp_${Date.now()}`;
      const now = new Date().toISOString();
      queryClient.setQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"], (old) => [
        { _id: tempId, title: trimmed, description: input.description?.trim() || undefined, completed: false, createdAt: now, updatedAt: now },
        ...(old ?? [])
      ]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSuccess: async () => {
      setAddTitle("");
      setAddDescription("");
      setIsAddOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = tasks.find((t) => t._id === id);
      return updateTask(id, { completed: !task?.completed });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"]);
      queryClient.setQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"], (old) =>
        (old ?? []).map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteTask(id);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"]);
      queryClient.setQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"], (old) => (old ?? []).filter((t) => t._id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const editMutation = useMutation({
    mutationFn: async (input: { id: string; title: string; description?: string }) =>
      updateTask(input.id, { title: input.title.trim(), description: input.description?.trim() || undefined }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"]);
      queryClient.setQueryData<Awaited<ReturnType<typeof listTasks>>>(["tasks"], (old) =>
        (old ?? []).map((t) =>
          t._id === input.id ? { ...t, title: input.title.trim(), description: input.description?.trim() || undefined } : t
        )
      );
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSuccess: () => {
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const openEdit = (id: string) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    setEditingId(id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  };

  const confirmDelete = (id: string, taskTitle: string) => {
    Alert.alert("Delete task?", taskTitle, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.topRow}>
        <Text style={styles.h1}>Your Tasks</Text>
        <Button title="Logout" onPress={() => void signOut()} variant="secondary" />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Let's smash your goals! 🚀</Text>
            <Text style={styles.summarySubtitle}>
              {totalTasks === 0
                ? "No tasks yet. Create one to get started!"
                : `${completedTasks} of ${totalTasks} tasks completed`}
            </Text>
          </View>
          <Text style={styles.summaryPercent}>
            {Math.round(completionRate * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${completionRate * 100}%` }]} />
        </View>
      </View>

      <View style={styles.filters}>
        <FilterPill label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterPill label="Active" active={filter === "active"} onPress={() => setFilter("active")} />
        <FilterPill label="Completed" active={filter === "completed"} onPress={() => setFilter("completed")} />
      </View>

      {tasksQuery.isLoading ? (
        <Loader />
      ) : tasksQuery.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn’t load tasks</Text>
          <Text style={styles.errorText}>{getErrorMessage(tasksQuery.error)}</Text>
          <View style={{ height: 12 }} />
          <Button title="Retry" onPress={() => void tasksQuery.refetch()} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={(filteredTasks.length ?? 0) === 0 ? styles.emptyContainer : styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              busy={toggleMutation.isPending || deleteMutation.isPending || editMutation.isPending}
              onToggle={() => toggleMutation.mutate(item._id)}
              onDelete={() => confirmDelete(item._id, item.title)}
              onEdit={() => openEdit(item._id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyText}>Tap the + button to add your first task.</Text>
            </View>
          }
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => setIsAddOpen(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={isAddOpen} transparent animationType="slide" onRequestClose={() => setIsAddOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAddOpen(false)} />
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={{ width: "100%" }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <Input
                label="Title"
                value={addTitle}
                onChangeText={setAddTitle}
                placeholder="What do you need to do?"
                autoCapitalize="sentences"
              />
              <Input
                label="Description (optional)"
                value={addDescription}
                onChangeText={setAddDescription}
                placeholder="Add more details or links…"
                autoCapitalize="sentences"
              />
              {!!createMutation.error && <Text style={styles.error}>{getErrorMessage(createMutation.error)}</Text>}
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsAddOpen(false)} />
                <Button
                  title="Create"
                  onPress={() => createMutation.mutate({ title: addTitle, description: addDescription })}
                  disabled={addTitle.trim().length === 0 || createMutation.isPending}
                  loading={createMutation.isPending}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setEditingId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingId(null)} />
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={{ width: "100%" }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <Input
                label="Title"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Task title"
                autoCapitalize="sentences"
              />
              <Input
                label="Description (optional)"
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Add more details…"
                autoCapitalize="sentences"
              />
              {!!editMutation.error && <Text style={styles.error}>{getErrorMessage(editMutation.error)}</Text>}
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="secondary" onPress={() => setEditingId(null)} />
                <Button
                  title="Save"
                  onPress={() =>
                    editingTask ? editMutation.mutate({ id: editingTask._id, title: editTitle, description: editDescription }) : null
                  }
                  disabled={!editingTask || editTitle.trim().length === 0}
                  loading={editMutation.isPending}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pillStyles.base, active && pillStyles.active, pressed && { opacity: 0.9 }]}>
      <Text style={[pillStyles.text, active && pillStyles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const pillStyles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card
  },
  active: { backgroundColor: theme.colors.primary, borderColor: "transparent" },
  text: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
  textActive: { color: "#0B0F1A" }
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.md, backgroundColor: theme.colors.bg },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: Platform.OS === "ios" ? 12 : 6 },
  h1: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: 0.2 },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "800" },
  summarySubtitle: { color: theme.colors.muted, fontSize: 14, marginTop: 4 },
  summaryPercent: { color: theme.colors.primary, fontSize: 22, fontWeight: "900" },
  progressBarBg: { height: 6, backgroundColor: "rgba(232, 238, 249, 0.08)", borderRadius: 3, width: "100%", overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 3 },
  filters: { flexDirection: "row", gap: theme.spacing.sm },
  listContainer: { paddingBottom: 100, gap: theme.spacing.md },
  emptyContainer: { flexGrow: 1, justifyContent: "center", paddingBottom: 100 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "700" },
  emptyText: { color: theme.colors.muted, marginTop: 6, textAlign: "center", fontSize: 14 },
  error: { color: theme.colors.danger, fontWeight: "600" },
  errorTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "800" },
  errorText: { color: theme.colors.muted, marginTop: 6, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  fabText: { color: "#0B0F1A", fontSize: 32, fontWeight: "700", marginTop: -2 },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.lg + 4,
    borderTopRightRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingBottom: Platform.OS === "ios" ? 40 : 24
  },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "900", marginBottom: 4 },
  modalActions: { flexDirection: "row", gap: theme.spacing.sm, marginTop: 8 }
});
