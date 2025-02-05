// GenerateQuiz.js
"use client";
import { db } from "@/firebase";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateQuiz() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const router = useRouter();

  const handleOptionChange = (quizIndex, selectedOption) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [quizIndex]: selectedOption,
    }));
  };

  // Submit text to generate quizzes
  const handleSubmit = async () => {
    setLoading(true);

    fetch("api/generatequiz", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false); // Hide loading state in case of error
      });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveQuizzes = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().quizzes || [];
      if (collections.find((q) => q.name === name)) {
        alert("Quiz collection with the same name already exists.");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { quizzes: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { quizzes: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    quizzes.forEach((quiz) => {
      const quizDocRef = doc(colRef);
      batch.set(quizDocRef, quiz);
    });

    await batch.commit();
    handleClose();
    router.push("/quizzes");
  };

  const handleQuizSubmit = (quizIndex) => {
    const selectedAnswer = selectedOptions[quizIndex];
    const correctAnswer = quizzes[quizIndex].correctAnswer;

    setResults((prev) => ({
      ...prev,
      [quizIndex]: {
        isCorrect: selectedAnswer === correctAnswer,
        correctAnswer,
      },
    }));
  };

  return (
    <>
      <Container maxWidth="100vw">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Quiz Generator
            </Typography>
            <Button color="inherit" href="/">
              Home Page
            </Button>
            <SignedOut>
              <Button color="inherit" href="/sign-in">
                Login
              </Button>
              <Button color="inherit" href="/sign-up">
                Sign Up
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </AppBar>
      </Container>

      <Container maxWidth="md">
        <Box
          sx={{
            mt: 4,
            mb: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Generate Quizzes</Typography>
          <Paper sx={{ p: 4, width: "100%" }}>
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
            >
              Submit
            </Button>
          </Paper>
        </Box>

        {quizzes.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5">Quiz Preview</Typography>
            <Grid container spacing={3}>
              {quizzes.map((quiz, quizIndex) => (
                <Grid item xs={12} sm={6} md={4} key={quizIndex}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <CardActionArea>
                      <CardContent>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ fontWeight: "bold", mb: 2 }}
                        >
                          {quiz.question}
                        </Typography>
                        <RadioGroup
                          value={selectedOptions[quizIndex] || ""}
                          onChange={(e) =>
                            handleOptionChange(quizIndex, e.target.value)
                          }
                        >
                          {quiz.options.map((option, i) => (
                            <FormControlLabel
                              key={i}
                              value={option}
                              control={<Radio />}
                              label={option}
                            />
                          ))}
                        </RadioGroup>

                        {results[quizIndex] && (
                          <Typography
                            variant="body1"
                            color={
                              results[quizIndex].isCorrect ? "green" : "red"
                            }
                          >
                            {results[quizIndex].isCorrect
                              ? "Correct!"
                              : `Incorrect. Correct answer: ${results[quizIndex].correctAnswer}`}
                          </Typography>
                        )}

                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleQuizSubmit(quizIndex)}
                          sx={{ mt: 2 }}
                        >
                          Submit Answer
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpen}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Save Quizzes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your quiz collection.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Collection Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={saveQuizzes}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={loading}
        message="Please wait, your quizzes are loading..."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={6000}
      />

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1300,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
}
