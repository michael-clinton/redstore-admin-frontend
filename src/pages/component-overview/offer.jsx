import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios"; // ✅ your axios instance
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

const OfferAdmin = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch existing offer
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const { data } = await axiosInstance.get("/offers/offer-show");
        setOffer(data);
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            link: data.link || "",
            image: null, // No file from API
          });
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
        showSnackbar("Failed to fetch offer", "error");
      }
    };

    fetchOffer();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("link", form.link);
    if (form.image) formData.append("image", form.image);

    try {
      const { data } = await axiosInstance.post("/offers/offer", formData);
      showSnackbar("Offer saved successfully", "success");
      setOffer(data); // Refresh offer state
    } catch (err) {
      console.error("Error saving offer:", err);
      const msg = err.response?.data?.error || "Failed to save offer";
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {offer ? "Update Offer" : "Create Offer"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <TextField
          fullWidth
          label="Link"
          name="link"
          value={form.link}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {form.image && (
            <Typography sx={{ mt: 1 }} variant="body2">
              Selected: {form.image.name}
            </Typography>
          )}
        </Box>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Offer"}
        </Button>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OfferAdmin;
