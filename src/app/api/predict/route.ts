
// src/app/api/predict/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { predictPrice, type PredictionInput, type PredictionOutput } from '../../../ai/flows/price-prediction'; // Adjusted path

export async function POST(request: NextRequest) {
  try {
    const inputData = (await request.json()) as PredictionInput;

    // Validate inputData here if necessary, using the Zod schema from the flow might be a good idea
    // For simplicity, direct call is shown

    const predictionResult = await predictPrice(inputData);

    return NextResponse.json<PredictionOutput>(predictionResult, { status: 200 });
  } catch (error: any) {
    console.error('API Prediction Error:', error);
    // It's good practice to not expose raw error messages to the client
    // In a real app, you might map error types to user-friendly messages
    return NextResponse.json({ message: error.message || 'Failed to get prediction' }, { status: 500 });
  }
}
