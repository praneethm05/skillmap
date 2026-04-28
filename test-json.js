try {
  JSON.parse('{\n "topic": "React Native",\n    "currentLevel": "beginner",\n    "weeklyHours": 5,\n    "targetWeeks": 4,\n\n}');
} catch(e) {
  console.log(e.message);
}
