import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import Autor from '../models/Autor';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getAuthorInfo(authorName: string) {
    const prompt = `
    Bitte antworte ausschließlich mit einem **gültigen und kommentarlosen JSON-Objekt** im folgenden Format:\n"

        Provide information about ${authorName} in the following JSON format:
        {
            "geborenAm": "YYYY-MM-DD",
            "geborenIn": "birth place in German",
            "gestorbenAm": "YYYY-MM-DD",
            "gestorbenIn": "death place in German",
            "beschreibung": "100-word description in German focusing on their philosophical worldview and contributions"
        }
        If a specific date is unknown, use null. Ensure the description is exactly 100 words.
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        const response = completion.choices[0].message.content?.trim() || '{}';
        const cleanedResponse = response
            .replace(/^```json\n/, '')
            .replace(/\n```$/, '');

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error(`Error getting info for ${authorName}:`, error);
        return null;
    }
}

async function fillAuthorSchema() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Get unique authors from Gedanke collection
        const authors = await Autor.find({});
        console.log(`Found ${authors.length} unique authors`);

        // Create author entries and update gedanken
        for (const author of authors) {
            const existingAuthor = await Autor.findOne({ name: author.name });
            let authorId;

            if (!author.name) {
                console.log(`Skipping ${author.name} as it is null`);
                continue;
            }

            const authorInfo = await getAuthorInfo(author.name);
            const lastName =
                author.name.split(' ').pop()?.toLowerCase() || 'unknown';

            if (!existingAuthor) {
                const newAuthor = new Autor({
                    id: uuidv4(),
                    name: author.name,
                    geborenAm: authorInfo?.geborenAm || null,
                    geborenIn: authorInfo?.geborenIn || null,
                    gestorbenAm: authorInfo?.gestorbenAm || null,
                    gestorbenIn: authorInfo?.gestorbenIn || null,
                    bild: `${lastName}.png`,
                    beschreibung: authorInfo?.beschreibung || '',
                });
                await newAuthor.save();
                console.log(`Created author with info: ${author.name}`);
                authorId = newAuthor.id;
            } else {
                // Update existing author with new information
                await Autor.updateOne(
                    { _id: existingAuthor._id },
                    {
                        $set: {
                            geborenAm:
                                authorInfo?.geborenAm ||
                                existingAuthor.geborenAm,
                            geborenIn:
                                authorInfo?.geborenIn ||
                                existingAuthor.geborenIn,
                            gestorbenAm:
                                authorInfo?.gestorbenAm ||
                                existingAuthor.gestorbenAm,
                            gestorbenIn:
                                authorInfo?.gestorbenIn ||
                                existingAuthor.gestorbenIn,
                            bild: `${lastName}.png`,
                            beschreibung:
                                authorInfo?.beschreibung ||
                                existingAuthor.beschreibung,
                        },
                    }
                );
                console.log(`Updated author info: ${author.name}`);
                authorId = existingAuthor.id;
            }
        }

        console.log('Author schema population and gedanken updates completed');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
fillAuthorSchema();
