"use client";

import { db } from "@/firebase";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import DeleteIcon from "@mui/icons-material/Delete"; // Import the delete icon
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    const docRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      const updatedCollections = collections.filter(
        (flashcard) => flashcard.name !== id
      );

      // Update the Firestore document
      await setDoc(docRef, { flashcards: updatedCollections });

      // Update the local state
      setFlashcards(updatedCollections);
    }
  };

  // Filter flashcards based on search query
  const filteredFlashcards = flashcards.filter((flashcard) =>
    flashcard.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Container maxWidth="100vw">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Flashcard SaaS
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
      <Container maxWidth="100vw">
        <Box sx={{ mt: 4, mb: 2 }}>
          <TextField
            label="Search Collections"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Grid
          container
          spacing={3}
          sx={{
            mt: 4,
          }}
        >
          {filteredFlashcards.length > 0 ? (
            filteredFlashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea
                    onClick={() => {
                      handleCardClick(flashcard.name); // Correct reference to flashcard.id
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{flashcard.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box
                    sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}
                  >
                    <IconButton
                      onClick={() => handleDelete(flashcard.name)} // Call delete function
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{ textAlign: "center", width: "100%" }}
            >
              No flashcards found
            </Typography>
          )}
        </Grid>
      </Container>
    </>
  );
}
