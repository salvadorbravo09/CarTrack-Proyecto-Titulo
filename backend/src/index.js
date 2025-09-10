import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server corriendo en el puerto: ${PORT}`);
});
