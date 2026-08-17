const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const newsReplacement = `    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });`;

const researchReplacement = `    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });`;

content = content.replace(/model: 'gemini-2\.5-flash'/g, "model: 'gemini-1.5-pro'");
fs.writeFileSync('server.ts', content);
console.log("Replaced models");
