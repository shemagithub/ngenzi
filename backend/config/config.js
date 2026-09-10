import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

export const config = {
    port: process.env.PORT || 3000,
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    modelId: process.env.MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2',
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    openAIApiKey: process.env.OPENAI_API_KEY,
    azureApiKey: process.env.AZURE_API_KEY,
    useAzure: process.env.USE_AZURE === 'true',
};


