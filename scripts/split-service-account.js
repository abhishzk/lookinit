const fs = require('fs');

// Read the service account file
const serviceAccount = fs.readFileSync('./firebase-service-account.json', 'utf8');

// Determine chunk size (less than 4KB to be safe)
const chunkSize = 3000;

// Split into chunks
const chunks = [];
for (let i = 0; i < serviceAccount.length; i += chunkSize) {
  chunks.push(serviceAccount.substring(i, i + chunkSize));
}

// Output the chunks
console.log(`Split into ${chunks.length} chunks`);
console.log(`FIREBASE_SA_CHUNKS_COUNT=${chunks.length}`);
chunks.forEach((chunk, i) => {
  console.log(`FIREBASE_SA_CHUNK_${i}=${chunk}`);
});
