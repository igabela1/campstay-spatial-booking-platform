// src/ai/flows/personalized-recommendation.ts
"use server";

/**
 * @fileOverview Provides personalized accommodation recommendations for guests
 * based on budget, number of guests and preferences.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const PersonalizedRecommendationInputSchema = z.object({
  guests: z.number().describe("Number of guests."),
  budget: z.number().describe("Guest budget for accommodation."),
  preferences: z
    .string()
    .optional()
    .describe("Accommodation preferences, such as bungalow, tent pitch, camper pitch, apartment or pool cottage."),
});

export type PersonalizedRecommendationInput = z.infer<
  typeof PersonalizedRecommendationInputSchema
>;

const PersonalizedRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe("A personalized recommendation of suitable accommodation options."),
});

export type PersonalizedRecommendationOutput = z.infer<
  typeof PersonalizedRecommendationOutputSchema
>;

export async function personalizedRecommendation(
  input: PersonalizedRecommendationInput
): Promise<PersonalizedRecommendationOutput> {
  return personalizedRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: "mirisLjetaAccommodationRecommendationPrompt",
  input: { schema: PersonalizedRecommendationInputSchema },
  output: { schema: PersonalizedRecommendationOutputSchema },
  prompt: `You are a helpful assistant for Auto Kamp Miris Ljeta.

Recommend the most suitable accommodation option for a guest based on:
- number of guests
- budget
- preferences

Available accommodation types:
- tent pitch
- camper pitch
- bungalow
- apartment
- pool cottage

Guests: {{{guests}}}
Budget: {{{budget}}}
Preferences: {{{preferences}}}

Provide a clear and friendly recommendation.`,
});

const personalizedRecommendationFlow = ai.defineFlow(
  {
    name: "mirisLjetaAccommodationRecommendationFlow",
    inputSchema: PersonalizedRecommendationInputSchema,
    outputSchema: PersonalizedRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);