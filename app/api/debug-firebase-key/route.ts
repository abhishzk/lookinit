import { NextResponse } from 'next/server';

export async function GET() {
  const parts = [];
  for (let i = 1; i <= 5; i++) {
    const part = process.env[`FIREBASE_PRIVATE_KEY_PART_${i}`];
    parts.push({
      [`part${i}`]: !!part,
      [`part${i}Length`]: part?.length || 0
    });
  }

  const hasAllParts = parts.every(part => Object.values(part)[0] === true);
  const totalLength = parts.reduce((sum, part) => sum + (Object.values(part)[1] as number), 0);

  return NextResponse.json({
    hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasAllPrivateKeyParts: hasAllParts,
    totalReconstructedLength: totalLength,
    parts,
    hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  });
}