import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import MainCard from "components/MainCard";
import axiosInstance from "../../api/axios"; // ✅ using correct axios instance path

const TestimonialManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("info");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [text, setText] = useState("");
  const [rating, setRating] = useState("");
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
    if (newIndex === 1) fetchTestimonials();
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/testimonials");
      setTestimonials(response.data);
    } catch (error) {
      showMessage(`Failed to fetch testimonials: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, severity) => {
    setMessage(msg);
    setMessageSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleUserImageChange = (e) => {
    setUserImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", text);
    formData.append("rating", rating);
    formData.append("userName", userName);
    formData.append("userImage", userImage);

    try {
      const response = await axiosInstance.post("/testimonials", formData);
      showMessage("Testimonial added successfully!", "success");
      setText("");
      setRating("");
      setUserName("");
      setUserImage(null);
      fetchTestimonials();
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      showMessage(`Failed to add testimonial: ${msg}`, "error");
    }
  };

  const openDeleteDialog = (id) => {
    setTestimonialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/testimonials/${testimonialToDelete}`);
      showMessage("Testimonial deleted successfully.", "success");
      setTestimonials((prev) =>
        prev.filter((t) => t._id !== testimonialToDelete)
      );
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      showMessage(`Failed to delete testimonial: ${msg}`, "error");
    } finally {
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    }
  };

  return (
    <MainCard title="Testimonial Management">
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Add Testimonial" />
        <Tab label="View Testimonials" />
      </Tabs>

      {tabIndex === 0 && (
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Testimonial Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                multiline
                rows={4}
                required
              />
              <TextField
                label="Rating (1-5)"
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                inputProps={{ min: 1, max: 5 }}
                required
              />
              <TextField
                label="User Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
              <Button variant="contained" component="label">
                Upload User Image
                <input type="file" hidden onChange={handleUserImageChange} />
              </Button>
              {userImage && (
                <Box>
                  <Typography>Image Preview:</Typography>
                  <img
                    src={URL.createObjectURL(userImage)}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "150px" }}
                  />
                </Box>
              )}
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Stack>
          </form>
        </Paper>
      )}

      {tabIndex === 1 && (
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
          {loading ? (
            <CircularProgress />
          ) : testimonials.length > 0 ? (
            <Grid container spacing={3}>
              {testimonials.map((testimonial) => (
                <Grid item xs={12} sm={6} md={4} key={testimonial._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={testimonial.userImage}
                      alt={testimonial.userName}
                    />
                    <CardContent>
                      <Typography>{testimonial.text}</Typography>
                      <Typography>Rating: {testimonial.rating}/5</Typography>
                      <Typography>User: {testimonial.userName}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="error"
                        onClick={() => openDeleteDialog(testimonial._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No testimonials found.</Typography>
          )}
        </Paper>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this testimonial?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={messageSeverity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default TestimonialManagement;
