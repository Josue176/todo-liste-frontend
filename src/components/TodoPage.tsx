import { Check, Delete, Done } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CssBaseline,
  Fade
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRef, useState } from 'react';

interface TaskState {
  id: number;
  name: string;
  isEditing: boolean;
  originalName: string;
  datetime: string;
  done?: boolean;
}

const darkBlueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
    success: {
      main: '#00e676',
    },
    error: {
      main: '#ff1744',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
});

const TodoPage = () => {
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDatetime, setNewTaskDatetime] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Ajout d'une tâche
  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      setSnackbar({
        open: true,
        message: 'Le nom de la nouvelle tâche ne peut pas être vide.',
        severity: 'error'
      });
      return;
    }
    if (!newTaskDatetime) {
      setSnackbar({
        open: true,
        message: 'Veuillez choisir une date et une heure.',
        severity: 'error'
      });
      return;
    }
    setTasks(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newTaskName,
        isEditing: false,
        originalName: newTaskName,
        datetime: newTaskDatetime,
        done: false
      }
    ]);
    setNewTaskName('');
    setNewTaskDatetime('');
    setSnackbar({ open: true, message: 'Tâche ajoutée !', severity: 'success' });
  };

  // Suppression d'une tâche
  const handleDelete = async (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setSnackbar({ open: true, message: 'Tâche supprimée !', severity: 'success' });
    setDeleteDialog({ open: false, id: null });
  };

  // Début de l'édition
  const handleStartEdit = (id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, isEditing: true } : task
      )
    );
    setTimeout(() => {
      inputRefs.current[id]?.focus();
    }, 100);
  };

  // Annuler l'édition
  const handleCancelEdit = (id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? { ...task, isEditing: false, name: task.originalName }
          : task
      )
    );
  };

  // Changement du texte d'une tâche
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number
  ) => {
    const { value } = event.target;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, name: value } : task
      )
    );
  };

  // Changement de la date/heure d'une tâche en édition
  const handleDatetimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const { value } = event.target;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, datetime: value } : task
      )
    );
  };

  // Marquer une tâche comme faite/non faite
  const handleToggleDone = (id: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  // Validation de la modification
  const handleUpdateTask = async (taskToUpdate: TaskState) => {
    if (!taskToUpdate.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Le nom de la tâche ne peut pas être vide.',
        severity: 'error'
      });
      return;
    }
    if (!taskToUpdate.datetime) {
      setSnackbar({
        open: true,
        message: 'Veuillez choisir une date et une heure.',
        severity: 'error'
      });
      return;
    }
    if (
      taskToUpdate.name === taskToUpdate.originalName &&
      !taskToUpdate.isEditing
    ) {
      setSnackbar({
        open: true,
        message: 'Aucune modification détectée.',
        severity: 'error'
      });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskToUpdate.id ? { ...task, isEditing: false } : task
        )
      );
      return;
    }
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskToUpdate.id
          ? {
              ...task,
              isEditing: false,
              originalName: task.name
            }
          : task
      )
    );
    setSnackbar({ open: true, message: 'Tâche modifiée !', severity: 'success' });
  };

  // Calcul progression
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const percent = total ? (done / total) * 100 : 0;

  return (
    <ThemeProvider theme={darkBlueTheme}>
      <CssBaseline />
      <Container>
        <Box display="flex" justifyContent="center" mt={5}>
          <Typography variant="h2">HDM Todo List</Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={3}
          gap={1}
        >
          <TextField
            size="small"
            label="Nouvelle tâche"
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            sx={{ maxWidth: 250 }}
          />
          <TextField
            type="datetime-local"
            size="small"
            label="Jour et heure"
            value={newTaskDatetime}
            onChange={e => setNewTaskDatetime(e.target.value)}
            sx={{ maxWidth: 250 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={handleAddTask}>
            Ajouter
          </Button>
        </Box>

        {/* Barre de progression */}
        <Box mt={3}>
          <Typography variant="body2">
            Progression : {done} / {total} tâches faites
          </Typography>
          <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
        </Box>

        <Box justifyContent="center" mt={5} flexDirection="column">
          {tasks.map(task => (
            <Fade in={true} timeout={600} key={task.id}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={2}
                gap={1}
                width="100%"
                sx={{
                  background: task.done ? "#1e3a5c" : "#132f4c",
                  opacity: task.done ? 0.6 : 1,
                  borderRadius: 2,
                  p: 1
                }}
              >
                <Button
                  variant={task.done ? "contained" : "outlined"}
                  color="success"
                  size="small"
                  onClick={() => handleToggleDone(task.id)}
                  sx={{ minWidth: 60, mr: 1 }}
                  startIcon={<Done />}
                >
                  {task.done ? "Fait" : "À faire"}
                </Button>
                <TextField
                  size="small"
                  value={task.name}
                  fullWidth
                  sx={{
                    maxWidth: 250,
                    textDecoration: task.done ? "line-through" : "none"
                  }}
                  onChange={e => handleInputChange(e, task.id)}
                  disabled={!task.isEditing}
                  inputRef={el => (inputRefs.current[task.id] = el)}
                />
                <TextField
                  type="datetime-local"
                  size="small"
                  value={task.datetime}
                  onChange={e => handleDatetimeChange(e as React.ChangeEvent<HTMLInputElement>, task.id)}
                  disabled={!task.isEditing}
                  sx={{ maxWidth: 200 }}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                  {task.datetime ? new Date(task.datetime).toLocaleString() : ''}
                </Typography>
                <Box>
                  {task.isEditing ? (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => handleUpdateTask(task)}
                        disabled={task.name.trim() === task.originalName && !task.isEditing}
                      >
                        <Check />
                      </IconButton>
                      <Button size="small" onClick={() => handleCancelEdit(task.id)}>
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleStartEdit(task.id)}
                      >
                        Modifier
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setDeleteDialog({ open: true, id: task.id })
                        }
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>

        {/* Snackbar pour notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Dialog de confirmation suppression */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: null })}
        >
          <DialogTitle>Supprimer la tâche</DialogTitle>
          <DialogContent>
            Voulez-vous vraiment supprimer cette tâche ?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
              Annuler
            </Button>
            <Button
              color="error"
              onClick={() => handleDelete(deleteDialog.id!)}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default TodoPage;