require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

const { firebaseReady } = require("./src/config/firebase");
console.log(firebaseReady);
