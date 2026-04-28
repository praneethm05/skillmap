const prompt = `
You are an expert curriculum designer. Create a structured learning plan for a beginner learner studying "React Native".
They have approximately 20 total hours to dedicate to this over 4 weeks.

Break the topic down into logical, sequential subtopics. For each subtopic, provide 1 to 3 HIGH QUALITY learning resources.
DO NOT invent or hallucinate URLs.

Return ONLY a valid JSON object matching the exact schema below. Do not include markdown formatting like \`\`\`json.

SCHEMA:
{
  "courseName": "String",
  "subtopics": [
    {
      "title": "String",
      "description": "String",
      "estimatedHours": 1,
      "resources": [
        {
          "title": "String",
          "type": "video",
          "url": "String"
        }
      ]
    }
  ]
}
`;

async function test() {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'deepseek-r1:8b',
      prompt,
      stream: false,
      format: 'json'
    })
  });
  const data = await res.json();
  console.log("RAW RESPONSE:");
  console.log(data.response);
}
test();
