'use server';
/**
 * @fileOverview Summarizes articles for display in Tetris block previews.
 *
 * - summarizeArticle - A function that summarizes an article.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the article to be summarized.'),
  topicTags: z.array(z.string()).describe('Array of strings representing topic tags for the article.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the article content, optimized for Tetris block preview.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `You are an AI assistant designed to provide concise summaries of articles for display within a Tetris game block preview. The summary should be engaging and informative, capturing the essence of the article in a single, short sentence.

Article Content: {{{articleContent}}}
Topic Tags: {{#each topicTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Summary:`,
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
