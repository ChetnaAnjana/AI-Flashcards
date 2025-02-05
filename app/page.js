"use client";
import { addDoc, collection, db, getDocs } from "@/firebase"; // Import Firebase functions
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Rating,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]); // Store reviews
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 0,
    review: "",
  });
  const [showReviews, setShowReviews] = useState(false); // State to manage reviews visibility

  // Function to handle review submission
  const handleSubmitReview = async () => {
    try {
      if (reviewForm.name && reviewForm.review) {
        await addDoc(collection(db, "reviews"), {
          name: reviewForm.name,
          rating: reviewForm.rating,
          review: reviewForm.review,
          timestamp: new Date(),
        });
        setReviewForm({ name: "", rating: 0, review: "" }); // Reset form
        fetchReviews(); // Fetch reviews after submission
      }
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

  // Fetch reviews from Firebase
  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reviews"));
      const reviewsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    }
  };

  useEffect(() => {
    fetchReviews(); // Fetch reviews on component mount
  }, []);

  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout_session", {
      method: "POST",
      headers: {
        origin: "http://localhost:3001",
      },
    });
    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });
    if (error) {
      console.warn(error.message);
    }
  };

  const handleGenerate = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      router.push("/generate");
    }
  };

  const handleGenerateQuiz = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      router.push("/generateQuiz");
    }
  };

  const handleCreate = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      router.push("/create");
    }
  };

  return (
    <Box>
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcard from your text" />
      </Head>
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
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h2" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" gutterBottom>
          The easiest way to make flashcards from your text.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, mr: 2 }}
          onClick={handleGenerateQuiz}
        >
          Generate Quizes
        </Button>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, mr: 2 }}
          onClick={handleGenerate}
        >
          Generate Flashcards
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, mr: 2 }}
          onClick={handleCreate}
        >
          Create Flashcards
        </Button>
      </Box>
      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Easy Text Input
            </Typography>
            <Typography>
              Simply input your text and let our software do the rest. Creating
              flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Smart Flashcards
            </Typography>
            <Typography>
              Our AI intelligently breaks down your text into concise
              flashcards, perfect for studying.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Easy Access
            </Typography>
            <Typography>
              Access your flashcards from any device, at any time. Study on the
              go with ease.
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Basic
              </Typography>
              <Typography variant="h5" gutterBottom>
                Free
              </Typography>
              <Typography>
                Access to basic flashcard features and limited storage.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleGenerate}
              >
                Choose Basic
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Pro
              </Typography>
              <Typography variant="h5" gutterBottom>
                $5/ month
              </Typography>
              <Typography>
                Unlimited flashcard and storage, with priority support.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
              >
                Choose Pro
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ my: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Customer Reviews
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", marginLeft: "500px" }}>
            <Typography sx={{ marginRight: "20px" }}>
              Name of the customer:
            </Typography>
            <TextField
              // label="Name"
              value={reviewForm.name}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, name: e.target.value })
              }
              sx={{
                mr: 2,
                "& .MuiInputBase-input": { padding: "8px" },
                height: "56px",
                "& .MuiFormControl-root": { height: "100%" },
              }}
            />
            <Rating
              name="rating"
              value={reviewForm.rating}
              onChange={(e, newValue) =>
                setReviewForm({ ...reviewForm, rating: newValue })
              }
            />
          </Box>
          <TextField
            label="Review"
            multiline
            value={reviewForm.review}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, review: e.target.value })
            }
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReview}
            sx={{ mt: 2 }}
          >
            Submit Review
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowReviews(!showReviews)}
            sx={{ mt: 2, ml: 2 }}
          >
            {showReviews ? "Hide Reviews" : "See Reviews"}
          </Button>
        </Box>
        {showReviews && (
          <Grid container spacing={4}>
            {reviews.map((review, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6">{review.name}</Typography>
                  <Rating value={review.rating} readOnly />
                  <Typography variant="body2">{review.review}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(review.timestamp.toDate()).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Box
        sx={{
          mt: 8,
          py: 4,
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center",
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Flashcard SaaS
            </Typography>
            <Typography>
              {" "}
              Empowering Learning through smart flashcards.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography>Email: chetnaanjana02@gmail.com</Typography>
            <Typography>Phone: 470-815-6785</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <IconButton
              color="inherit"
              href="https://github.com/ChetnaAnjana"
              target="_blank"
              rel="noopener"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              color="inherit"
              href="https://www.linkedin.com/in/chetna-anjana-695932206/"
              target="_blank"
              rel="noopener"
            >
              <LinkedInIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
