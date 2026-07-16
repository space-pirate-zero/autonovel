
'use server';
/**
 * @fileOverview Enhances article content by generating a summary and tags.
 *
 * - enhanceArticle - A function that enhances an article.
 * - EnhanceArticleInput - The input type for the enhanceArticle function.
 * - EnhanceArticleOutput - The return type for the enhanceArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceArticleInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the article to be enhanced.'),
});
export type EnhanceArticleInput = z.infer<typeof EnhanceArticleInputSchema>;

const EnhanceArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the article content.'),
  tags: z.array(z.string()).describe('An array of SEO-friendly tags for the article.'),
});
export type EnhanceArticleOutput = z.infer<typeof EnhanceArticleOutputSchema>;

export async function enhanceArticle(input: EnhanceArticleInput): Promise<EnhanceArticleOutput> {
  return enhanceArticleFlow(input);
}

const enhanceArticlePrompt = ai.definePrompt({
  name: 'enhanceArticlePrompt',
  input: {schema: EnhanceArticleInputSchema},
  output: {schema: EnhanceArticleOutputSchema},
  prompt: `You are an AI assistant designed to enhance articles by providing a summary and generating relevant tags for display and SEO.

Article Content: {{{articleContent}}}

Based on the article, provide a concise summary and a list of 5-7 relevant tags. The tags should be dynamic and based on the summary and the overall content.`,
});

const enhanceArticleFlow = ai.defineFlow(
  {
    name: 'enhanceArticleFlow',
    inputSchema: EnhanceArticleInputSchema,
    outputSchema: EnhanceArticleOutputSchema,
  },
  async input => {
    const {output} = await enhanceArticlePrompt(input);
    return output!;
  }
);
