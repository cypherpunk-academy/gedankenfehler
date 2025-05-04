"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const Autor_1 = __importDefault(require("../models/Autor"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
async function getAuthorInfo(authorName) {
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
    }
    catch (error) {
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
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Get unique authors from Gedanke collection
        const authors = await Autor_1.default.find({});
        console.log(`Found ${authors.length} unique authors`);
        // Create author entries and update gedanken
        for (const author of authors) {
            const existingAuthor = await Autor_1.default.findOne({ name: author.name });
            let authorId;
            if (!author.name) {
                console.log(`Skipping ${author.name} as it is null`);
                continue;
            }
            const authorInfo = await getAuthorInfo(author.name);
            const lastName = author.name.split(' ').pop()?.toLowerCase() || 'unknown';
            if (!existingAuthor) {
                const newAuthor = new Autor_1.default({
                    id: (0, uuid_1.v4)(),
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
            }
            else {
                // Update existing author with new information
                await Autor_1.default.updateOne({ _id: existingAuthor._id }, {
                    $set: {
                        geborenAm: authorInfo?.geborenAm ||
                            existingAuthor.geborenAm,
                        geborenIn: authorInfo?.geborenIn ||
                            existingAuthor.geborenIn,
                        gestorbenAm: authorInfo?.gestorbenAm ||
                            existingAuthor.gestorbenAm,
                        gestorbenIn: authorInfo?.gestorbenIn ||
                            existingAuthor.gestorbenIn,
                        bild: `${lastName}.png`,
                        beschreibung: authorInfo?.beschreibung ||
                            existingAuthor.beschreibung,
                    },
                });
                console.log(`Updated author info: ${author.name}`);
                authorId = existingAuthor.id;
            }
        }
        console.log('Author schema population and gedanken updates completed');
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
// Run the script
fillAuthorSchema();
